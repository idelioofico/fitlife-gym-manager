
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-primary mb-2">404</h1>
        <p className="text-2xl text-muted-foreground mb-6">Página não encontrada</p>
        <p className="text-base text-muted-foreground mb-6 max-w-md">
          Não conseguimos encontrar a página que procura. Ela pode ter sido movida, removida ou nunca ter existido.
        </p>
        <Button asChild>
          <Link to="/">Voltar para o Início</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
