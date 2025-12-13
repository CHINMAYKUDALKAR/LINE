import { useState, useEffect } from "react";
import { UserRole } from "@/lib/api/users";

export function useUserRole() {
    // Mock role - in a real app this would come from an auth context or session
    const [role, setRole] = useState<UserRole>("ADMIN");
    const [isLoading, setIsLoading] = useState(false);

    return { role, isLoading, isAdmin: role === "ADMIN", isManager: ["ADMIN", "MANAGER"].includes(role) };
}

