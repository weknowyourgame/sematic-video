import { NextjsLogo, NotionLogo, ResendLogo, UpstashLogo } from "./svgs";
import { VercelLogo } from "./svgs";

export default function Powered() {
	return (
		<div className="flex flex-col items-center justify-center gap-12 py-12">
			<div className="flex flex-col items-center justify-center gap-2">
				<h3 className="text-foreground text-2xl font-semibold">Powered by</h3>
				<p className="text-muted-foreground text-base">
					Simple and Powerful tools that help you build faster.
				</p>
			</div>
			<div className="flex items-center sm:gap-12 gap-6">
				<VercelLogo />
				<NextjsLogo className="!dark:text-foreground" />
				{/* <CloudflareLogo /> */}
			</div>
		</div>
	);
}
