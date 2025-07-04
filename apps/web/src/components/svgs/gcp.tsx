import type { SVGProps } from "react";

export default function GcpLogo(props: SVGProps<SVGSVGElement>) {
	return (
		<svg
			height={24}
			width={24}
			fill="currentColor"
			viewBox="0 0 2268.6 1823.7"
			{...props}
			role="img"
			aria-label="Google Cloud Platform"
		>
			<path fill="#EA4335" d="M1508.7,503.5l197.2-197.2l13.1-83C1359.7-103.5,788.5-66.4,464.5,300.6c-90,101.9-156.7,229-192.3,360.3
			l70.6-10l394.4-65l30.4-31.1c175.4-192.7,472.1-218.6,674.6-54.7L1508.7,503.5z"/>
			<path fill="#4285F4" d="M1986.9,655c-45.3-166.9-138.4-317-267.8-431.8L1442.3,500c116.9,95.5,183.4,239.3,180.6,390.2v49.1
			c136,0,246.3,110.3,246.3,246.3c0,136-110.3,243.6-246.3,243.6h-493.3l-48.4,52.6v295.5l48.4,46.4h493.3
			c353.8,2.8,642.9-279.1,645.7-632.9C2270.3,976.3,2164.5,775.2,1986.9,655"/>
			<path fill="#34A853" d="M636.9,1823.7h492.7v-394.4H636.9c-34.9,0-69.3-7.6-101-22.1l-69.9,21.4l-198.6,197.2l-17.3,67.1
			C361.5,1777,497.4,1824.3,636.9,1823.7"/>
			<path fill="#FBBC05" d="M636.9,544.3C283,546.4-2.1,835,0,1188.9c1.2,197.6,93.5,383.6,250.1,504.1l285.8-285.8
			c-124-56-179.1-201.9-123.1-325.9c56-124,201.9-179.1,325.9-123.1c54.6,24.7,98.4,68.4,123.1,123.1l285.8-285.8
			C1026,636.5,837,543.6,636.9,544.3"/>
		</svg>
	);
}
