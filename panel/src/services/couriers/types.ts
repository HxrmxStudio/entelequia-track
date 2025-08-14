export type Courier = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    active: boolean;
    vehicle?: string;
    notes?: string;
  };
  
  export type CourierInput = Omit<Courier, 'id'>;
  