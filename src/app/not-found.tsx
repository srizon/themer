import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Page not found</h1>
      <p style={{ color: "#71717a", marginBottom: "1.5rem" }}>
        The page you are looking for does not exist.
      </p>
      <Link href="/" className="btn btn-primary">
        Go back home
      </Link>
    </main>
  );
}
