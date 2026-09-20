import { CustomerDetailsView } from "@/components/customers/CustomerDetailsView";

export default async function CustomerPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <CustomerDetailsView id={id} />;
}
