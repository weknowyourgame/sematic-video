"use client";

import { cn } from "~/lib/utils";
import { useScroll } from "~/hooks/use-scroll";
import { GithubLogo, NotionLogo } from "./svgs";
import { Button } from "./ui/button";
import Link from "next/link";
import AuthHeader from "./auth-header";

export default function Header() {
	const scrolled = useScroll();

	return (
		<header
			className={cn(
				"py-4 flex flex-row gap-2 justify-between items-center md:px-10 sm:px-6 px-4 sticky top-0 z-50",
				scrolled &&
					"bg-background/50 md:bg-transparent md:backdrop-blur-none backdrop-blur-sm",
			)}
		>
			<Link
				href="https://valiant-cobweb-66d.notion.site/1f6821a3f402802ca641e5e19d28a9b2?v=1f6821a3f402810d8a47000cad3beb2d&pvs=74"
				target="_blank"
				rel="noopener noreferrer"
				className="cursor-pointer"
			>
			</Link>

			<div className="flex items-center gap-2">
				<Link
					href="https://github.com/new?template_name=Waitly&template_owner=Idee8"
					target="_blank"
					rel="noopener noreferrer"
					className="cursor-pointer"
				>
				</Link>
				<AuthHeader />
			</div>
		</header>
	);
}
