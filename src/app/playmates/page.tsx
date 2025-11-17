import PlaymatesClient from "./PlaymatesClient";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Nos Playmates - ShePlays",
  description: "Découvrez nos playmates et réservez une session de jeu",
};

export default function PlaymatesPage() {
  return (
    <>
      <NavBar currentPath="/playmates" />
      <PlaymatesClient />
      <Footer />
    </>
  );
}
