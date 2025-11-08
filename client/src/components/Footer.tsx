import { Link } from "wouter";
import { Leaf, Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" data-testid="link-logo-footer">
              <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-md p-2 -m-2 inline-flex">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">EcoGuardian</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered carbon footprint tracking and sustainable living guidance. 
              Track, analyze, and reduce your environmental impact.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" data-testid="link-footer-dashboard">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Dashboard
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/calculator" data-testid="link-footer-calculator">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Carbon Calculator
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/chat" data-testid="link-footer-chat">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    AI Chat Agent
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/predictions" data-testid="link-footer-predictions">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Predictions
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/recommendations" data-testid="link-footer-recommendations">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Recommendations
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/learn-more" data-testid="link-footer-learn-more">
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Learn More
                  </span>
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-blog"
                >
                  Blog
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-help"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-privacy"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="link-footer-terms"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-3 mb-4">
              <li>
                <a 
                  href="mailto:hello@ecoguardian.app" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  data-testid="link-footer-email"
                >
                  <Mail className="h-4 w-4" />
                  hello@ecoguardian.app
                </a>
              </li>
            </ul>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-lg border hover-elevate active-elevate-2"
                aria-label="GitHub"
                data-testid="button-footer-github"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-lg border hover-elevate active-elevate-2"
                aria-label="Twitter"
                data-testid="button-footer-twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-lg border hover-elevate active-elevate-2"
                aria-label="LinkedIn"
                data-testid="button-footer-linkedin"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} EcoGuardian. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-primary fill-primary" /> for a sustainable future
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
