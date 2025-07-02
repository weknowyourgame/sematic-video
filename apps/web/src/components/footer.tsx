import { Icon } from "lucide-react";
import Link from "next/link";
import { GithubLogo } from "./svgs";

export default function Footer() {
  return (
    <footer className="flex flex-col justify-center items-center gap-4 pb-4">
      <div className="flex flex-row justify-between">
        <ul className="flex flex-row gap-4">
          <li className="dark:text-muted-foreground dark:hover:text-foreground cursor-pointer">
            Terms of Service
          </li>
          <li className="dark:text-muted-foreground dark:hover:text-foreground">
            •
          </li>
          <li className="dark:text-muted-foreground dark:hover:text-foreground">
            <Link href="">
              Privacy Policy
            </Link>
          </li>
          <li className="dark:text-muted-foreground dark:hover:text-foreground">
            <div className="flex flex-row items-center gap-1">
              <Link href="https://github.com/sarthakkapila/sematic-video">
                <GithubLogo className="w-6 h-6" />
              </Link>
              <Link href="https://github.com/sarthakkapila/sematic-video">
                Open Source
              </Link>
            </div>
          </li>
        </ul>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Made with ♥︎ by{" "}
          <Link href="https://sarthakkapila.com" className="font-semibold text-foreground">Sarthak Kapila</Link>
        </p>
      </div>
    </footer>
  );
}
