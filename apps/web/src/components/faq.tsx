import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";

export default function Faq() {
	return (
		<div className="flex flex-col items-center justify-center gap-6 py-10">
			<div className="flex flex-col items-center justify-center gap-2 max-w-md">
				<h2 className="sm:text-3xl text-2xl font-semibold text-foreground">
					Frequently Asked Questions
				</h2>
				<p className="sm:text-base text-sm text-muted-foreground text-center">
					Everything you need to know about Sematic Video. Find answers to common
					questions.
				</p>
			</div>
			<div className="w-full max-w-lg">
				<Accordion
					type="single"
					collapsible
					className="w-full flex flex-col gap-4"
				>
					<AccordionItem value="item-0">
						<AccordionTrigger className="hover:no-underline">
						Is there a free plan?
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
						Yes, sign up to try out of free tier (no credit card required).
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-1">
						<AccordionTrigger className="hover:no-underline">
						Is it Open Source?
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
						Yes, the code is open source and available on GitHub.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-2">
						<AccordionTrigger className="hover:no-underline">
						How do I get started?
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
						Upload a video and search what you want to find with natural language.
						</AccordionContent>
					</AccordionItem>
					<AccordionItem value="item-3">
						<AccordionTrigger className="hover:no-underline">
						What cloud providers does sematic video use?
						</AccordionTrigger>
						<AccordionContent className="text-muted-foreground">
						Sematic video uses Cloudflare R2 for storage and Cloudflare Workers for the backend.
						FFmpeg for video processing.
						OpenAI for embedding generation.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</div>
	);
}
