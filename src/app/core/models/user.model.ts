export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Administrator' | 'Registrar' | 'Academic Advisor';
  avatar?: string;
  token?: string;
}
