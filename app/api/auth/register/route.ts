import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { triggerDripSequence } from "@/lib/drip-engine";

export async function POST(req: NextRequest) {
  try {
    const { email, password, naam } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email en wachtwoord zijn verplicht" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Wachtwoord moet minimaal 8 tekens zijn" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check of user al bestaat
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      if (existingUser.password) {
        // User heeft al een wachtwoord — kan niet opnieuw registreren
        return NextResponse.json(
          { error: "Er bestaat al een account met dit emailadres. Probeer in te loggen." },
          { status: 409 }
        );
      }

      // Bestaande user (van scan) zonder wachtwoord — wachtwoord instellen
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          password: hashedPassword,
          naam: naam || existingUser.naam,
          emailVerified: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Wachtwoord ingesteld! Je kunt nu inloggen.",
        isExisting: true,
      });
    }

    // Nieuwe user aanmaken met 14-dagen Professional proefperiode
    const hashedPassword = await bcrypt.hash(password, 12);
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        naam: naam || null,
        emailVerified: new Date(),
        trialEndsAt,
      },
    });

    // Create a PROFESSIONAL subscription record for the trial period
    await prisma.subscription.create({
      data: {
        userId: newUser.id,
        tier: "PROFESSIONAL",
        status: "TRIALING",
        billingCycle: "MONTHLY",
      },
    });

    // Trigger Account Created drip sequence (non-blocking)
    triggerDripSequence("ACCOUNT_CREATED", newUser.id, normalizedEmail, { naam: naam || undefined }).catch((err) =>
      console.error("[register] Failed to trigger drip:", err)
    );

    // Trigger Trial Started drip sequence (day 3, 7, 12 reminders)
    triggerDripSequence("TRIAL_STARTED", newUser.id, normalizedEmail, { naam: naam || undefined }).catch((err) =>
      console.error("[register] Failed to trigger trial drip:", err)
    );

    return NextResponse.json({
      success: true,
      message: "Account aangemaakt! Je kunt nu inloggen.",
      isExisting: false,
    });
  } catch (error) {
    console.error("[Register] Error:", error);
    return NextResponse.json(
      { error: "Er ging iets mis. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}
