"use client";

import { approveProfessional } from "@/app/actions/professional";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Check } from "lucide-react";

export function ApproveProButton({ professionalId }: { professionalId: string }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveProfessional(professionalId);
      toast.success("Professional approved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve professional");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" onClick={handleApprove} disabled={loading} variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
      Approve
    </Button>
  );
}
