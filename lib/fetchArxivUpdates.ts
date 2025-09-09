// Simple static provider for Latest Updates with images
// Can be swapped later to fetch from an API or arXiv feed
export type UpdateItem = {
	id: string
	type: "Data Release" | "Publication" | "Webinar" | "Announcement"
	date: string
	title: string
	description: string
	action: string
	link: string
	imageUrl: string
	color: "blue" | "green" | "purple" | "orange"
}

export async function fetchLatestUpdates(): Promise<UpdateItem[]> {
	// Static list with royalty-free Unsplash images (hotlinked)
	// Note: We use <img> tags in the app, so Next image domain config isn't required.
	return [
		{
			id: "cygnss-2025",
			type: "Data Release",
			date: "Jan 2025",
			title: "New CYGNSS 2025 Data Released",
			description:
				"Latest CYGNSS observations are available with enhanced calibration and quality flags for improved ocean studies.",
			action: "Access Data",
			link: "https://science.nasa.gov/mission/cygnss/",
			imageUrl:
				"https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1200&auto=format&fit=crop", // satellite/space
			color: "blue",
		},
		{
			id: "paper-gnssr-ml",
			type: "Publication",
			date: "Dec 2024",
			title: "GNSS-R Soil Moisture with ML",
			description:
				"A new study demonstrates improved soil moisture retrieval using multi-constellation GNSS-R and transformer models.",
			action: "Read Paper",
			link: "https://arxiv.org/abs/2412.00072",
				imageUrl:
					"https://picsum.photos/seed/gnss-soil-ml/1200/800", // reliable placeholder image
			color: "green",
		},
		{
			id: "webinar-soil-moisture",
			type: "Webinar",
			date: "Feb 2025",
			title: "Advanced GNSS-R Soil Moisture Webinar",
			description:
				"Join our webinar covering practical GNSS-R workflows for soil moisture mapping and validation techniques.",
			action: "Register Now",
			link: "https://www.earthdata.nasa.gov/learn/webinars",
			imageUrl:
				"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop", // nature/fields
			color: "purple",
		},
	]
}
