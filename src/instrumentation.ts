export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { syncAdminRoles } = await import("./lib/admin-role");
    await syncAdminRoles();
  }
}
