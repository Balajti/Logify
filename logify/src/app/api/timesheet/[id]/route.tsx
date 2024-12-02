import { authOptions } from "@/lib/auth";
import { sql } from "@vercel/postgres";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

// Handle PATCH request to update an entry
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin_id = session.user.admin_id || session.user.id;

    const body = await request.json();
    const fields = [];
    const values: any[] = [];

    // Add each field to the query dynamically
    if (body.hours) {
      fields.push(`hours = $${fields.length + 1}`);
      values.push(body.hours);
    }
    if (body.description) {
      fields.push(`description = $${fields.length + 1}`);
      values.push(body.description);
    }
    if (body.project_id) {
      fields.push(`project_id = $${fields.length + 1}`);
      values.push(body.project_id);
    }
    if (body.task_id) {
      fields.push(`task_id = $${fields.length + 1}`);
      values.push(body.task_id);
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    values.push(admin_id, id); // Add admin_id and entry id to WHERE clause

    const query = `
      UPDATE timesheet
      SET ${fields.join(", ")}
      WHERE admin_id = $${values.length - 1} AND id = $${values.length}
      RETURNING *;
    `;

    const result = await sql.query(query, values);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update timesheet entry:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

// Handle DELETE request to delete an entry
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin_id = session.user.admin_id || session.user.id;

    const query = `
      DELETE FROM timesheet
      WHERE admin_id = $1 AND id = $2
      RETURNING *;
    `;
    const result = await sql.query(query, [admin_id, id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Failed to delete timesheet entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
