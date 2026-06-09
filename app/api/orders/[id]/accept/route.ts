import { applyValidation } from "@/lib/orders/validation";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const token = new URL(request.url).searchParams.get("token");
  return applyValidation(params.id, token, "acceptee");
}
