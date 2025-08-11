import React from "react";

const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-6 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          © {new Date().getFullYear()} Health Forecasts. All rights reserved.
        </div>
        <nav className="flex items-center gap-4">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Contact</a>
        </nav>
      </div>
    </footer>
  );
};

export default SiteFooter;
