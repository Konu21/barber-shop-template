export interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
}

export const services: Service[] = [
  {
    id: "tundere-clasica",
    name: "Tundere Clasică",
    price: "25",
    duration: "30 min",
  },
  {
    id: "styling-modern",
    name: "Styling Modern",
    price: "30",
    duration: "45 min",
  },
  {
    id: "aranjare-barba",
    name: "Aranjare Barbă",
    price: "15",
    duration: "20 min",
  },
  {
    id: "tratament-facial",
    name: "Tratament Facial",
    price: "20",
    duration: "25 min",
  },
  {
    id: "pachet-complet",
    name: "Pachet Complet",
    price: "60",
    duration: "90 min",
  },
  {
    id: "tundere-copii",
    name: "Tundere Copii",
    price: "18",
    duration: "25 min",
  },
];
