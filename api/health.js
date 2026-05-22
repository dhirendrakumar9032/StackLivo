export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ message: "Method not allowed." });
    return;
  }

  response.status(200).json({ status: "ok" });
}
