import { Separator } from "@/components/ui/separator";

/**
 * Component to display the export timestamp at the end of the report
 */
export function ExportTimestamp() {
  const now = new Date();
  
  // Format date: DD/MM/YYYY HH:MM
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;

  return (
    <div className="mt-12 pt-8">
      <Separator className="mb-6" />
      <div className="text-center text-sm text-muted-foreground">
        <p className="font-medium">Relatório extraído em: {formattedDate}</p>
      </div>
    </div>
  );
}


