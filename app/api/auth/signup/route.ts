import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Create user with admin privileges
    // TODO: Add wrapper to create users
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: { name },
    })

    if (userError) {
      console.error("Error creating user:", userError)
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    // If user was created successfully, create a profile
    if (userData.user) {
      // TODO: Add wrapper to create profile
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userData.user.id,
          name,
          is_onboarded: false,
        },
      ])

      if (profileError) {
        console.error("Error creating profile:", profileError)
        // We don't want to fail the whole request if just the profile creation fails
      }
    }

    return NextResponse.json({
      message: "User created successfully",
      user: userData.user,
    })
  } catch (error: any) {
    console.error("Unexpected error in signup route:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
