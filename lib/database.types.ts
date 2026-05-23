export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: string;
          logo_url: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["organizations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          org_id: string | null;
          full_name: string;
          role: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      properties: {
        Row: {
          id: string;
          org_id: string;
          owner_id: string;
          name: string;
          address: string;
          city: string;
          type: string;
          total_units: number;
          description: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["properties"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
      };
      units: {
        Row: {
          id: string;
          property_id: string;
          unit_number: string;
          floor: number | null;
          bedrooms: number;
          bathrooms: number;
          size_sqm: number | null;
          rent_amount: number;
          status: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["units"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["units"]["Insert"]>;
      };
      tenants: {
        Row: {
          id: string;
          org_id: string;
          user_id: string | null;
          full_name: string;
          email: string | null;
          phone: string | null;
          national_id: string | null;
          emergency_contact: string | null;
          trust_score: number;
          id_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tenants"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["tenants"]["Insert"]>;
      };
      leases: {
        Row: {
          id: string;
          org_id: string;
          tenant_id: string;
          unit_id: string;
          start_date: string;
          end_date: string;
          rent_amount: number;
          deposit_amount: number;
          status: string;
          payment_day: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leases"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["leases"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          org_id: string;
          lease_id: string;
          tenant_id: string;
          amount: number;
          due_date: string;
          paid_date: string | null;
          method: string | null;
          reference_number: string | null;
          status: string;
          proof_url: string | null;
          receipt_number: string | null;
          notes: string | null;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      maintenance_requests: {
        Row: {
          id: string;
          org_id: string;
          unit_id: string;
          tenant_id: string | null;
          title: string;
          description: string;
          priority: string;
          status: string;
          category: string | null;
          vendor_id: string | null;
          scheduled_date: string | null;
          completed_date: string | null;
          cost: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["maintenance_requests"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["maintenance_requests"]["Insert"]>;
      };
      vendors: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          category: string;
          phone: string | null;
          email: string | null;
          rating: number;
          active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vendors"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["vendors"]["Insert"]>;
      };
      applications: {
        Row: {
          id: string;
          org_id: string;
          listing_id: string | null;
          unit_id: string | null;
          applicant_name: string;
          applicant_email: string;
          applicant_phone: string | null;
          monthly_income: number | null;
          move_in_date: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["applications"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>;
      };
      listings: {
        Row: {
          id: string;
          org_id: string;
          unit_id: string;
          title: string;
          description: string | null;
          rent_amount: number;
          bedrooms: number;
          bathrooms: number;
          size_sqm: number | null;
          city: string;
          area: string | null;
          amenities: string[];
          images: string[];
          status: string;
          available_from: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["listings"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
      };
      documents: {
        Row: {
          id: string;
          org_id: string;
          related_id: string | null;
          related_type: string | null;
          name: string;
          file_url: string;
          file_type: string | null;
          file_size: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["documents"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      message_threads: {
        Row: {
          id: string;
          org_id: string;
          subject: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["message_threads"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["message_threads"]["Insert"]>;
      };
    };
  };
}
