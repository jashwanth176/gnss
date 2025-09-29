"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, Mail, Phone, MapPin, ExternalLink, Users, Globe } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { SiteLogo } from "@/components/SiteLogo"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - matching other pages */}
      <header className="border-b glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-4">
                <SiteLogo size="md" className="rounded-lg shadow-lg hover:shadow-xl transition-all duration-300" />
                <div>
                  <h1 className="text-2xl font-bold text-black">Contact Us</h1>
                  <p className="text-sm text-black">Get in touch with our research team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Introduction */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Spatial Intelligence Team
            </h2>
          </div>

          {/* Project Director moved to Team section below */}

          {/* Collapsible Sections: Team and Advisors/Mentors/Experts */}
          <div className="mb-12 space-y-6">
            <Accordion type="multiple" className="w-full" defaultValue={[]}>
              {/* Advisors/Mentors/Experts - shown first */}
              <AccordionItem value="advisors" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold">Advisors / Mentors / Experts</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-xl">Advisory Panel</CardTitle>
                      <CardDescription>Advisors, mentors and experts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Prof. YVN Krishnamurthy */}
                        <div className="p-4 rounded-lg bg-background/30 border flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                            <Image src="/yvn.jpg" alt="Prof. YVN Krishnamurthy" fill sizes="64px" className="object-cover" />
                          </div>
                          <div>
                            <h4 className="font-semibold leading-tight">Prof. YVN Krishnamurthy</h4>
                            <p className="text-xs text-muted-foreground">IIT Tirupati • Advisor / Mentor</p>
                          </div>
                        </div>

                        {/* Dr. Avardh B Narayan */}
                        <div className="p-4 rounded-lg bg-background/30 border flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                            <Image src="/avadh.jpg" alt="Dr. Avardh B Narayan" fill sizes="64px" className="object-cover" />
                          </div>
                          <div>
                            <h4 className="font-semibold leading-tight">Dr. Avardh B Narayan</h4>
                            <p className="text-xs text-muted-foreground">IIT Tirupati • Advisor / Expert</p>
                          </div>
                        </div>

                        {/* Dr. Ramesh Patel */}
                        <div className="p-4 rounded-lg bg-background/30 border flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                            <Image src="/ramesh.jpg" alt="Dr. Ramesh Patel" fill sizes="64px" className="object-cover" />
                          </div>
                          <div>
                            <h4 className="font-semibold leading-tight">Dr. Ramesh Patel</h4>
                            <p className="text-xs text-muted-foreground">IIT Tirupati • Advisor / Expert</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* Team - includes Research Fellow and Developer (shown second) */}
              <AccordionItem value="team" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold">Team</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-4 space-y-6">
                  {/* Dr. Roshan Srivastav */}
                  <Card className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-full overflow-hidden border">
                            <Image src="/roshan.jpg" alt="Dr. Roshan Srivastav" fill sizes="64px" className="object-cover" />
                          </div>
                          <CardTitle className="flex items-center gap-3 text-xl">
                            <Users className="h-5 w-5 text-primary" />
                            Dr. Roshan Srivastav
                          </CardTitle>
                        </div>
                      </div>
                      <CardDescription>
                        Associate Professor, Dept. of Civil & Environmental Engineering, IIT Tirupati
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-3 rounded-lg bg-background/50 border">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="space-y-1">
                              <a href="mailto:project.director@iittnif.com" className="block text-sm font-medium hover:text-primary transition-colors">project.director@iittnif.com</a>
                              <a href="mailto:roshan@iittp.ac.in" className="block text-sm text-muted-foreground hover:text-primary transition-colors">roshan@iittp.ac.in</a>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50 border">
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                            <a href="tel:+919750447774" className="text-sm font-medium hover:text-primary transition-colors">+91-9750447774</a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Research Fellow */}
                  <Card className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <Users className="h-5 w-5 text-primary" />
                          Dr. G Naga Sai Madhavi
                        </CardTitle>
                        <Badge variant="outline" className="border-primary/50 text-primary">
                          Chanakya Post Doctoral Fellow
                        </Badge>
                      </div>
                      <CardDescription>
                        IITTNIF, IIT Tirupati
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Research Expertise</h4>
                          <p className="text-muted-foreground mb-3">GNSS‑R signal processing and remote sensing.</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Signal Processing</Badge>
                            <Badge variant="secondary">Remote Sensing</Badge>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50 border">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                            <a href="mailto:postdoc_nsm@iittnif.com" className="text-sm font-medium hover:text-primary transition-colors">postdoc_nsm@iittnif.com</a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Developer */}
                  <Card className="glass-card">
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <Users className="h-5 w-5 text-primary" />
                          Jashwanth Valurouthu
                        </CardTitle>
                        <Badge variant="outline" className="border-secondary/50 text-secondary">
                          Developer
                        </Badge>
                      </div>
                      <CardDescription>Full Stack Developer, GNSS R Portal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Development Expertise</h4>
                          <p className="text-muted-foreground mb-3">Building the GNSS R web portal and interactive data visualizations.</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">Web Development</Badge>
                            <Badge variant="secondary">Data Visualization</Badge>
                            <Badge variant="secondary">UI/UX</Badge>
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50 border">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                            <a 
                              href="mailto:vjashwanth.ai@gmail.com"
                              className="text-sm font-medium hover:text-primary transition-colors"
                            >
                              vjashwanth.ai@gmail.com
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Location */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  Our Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">Geo-Intelligence and Applications Laboratory</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    IIT Tirupati Navavishkar I-Hub Foundation (IITTNiF)<br />
                    IIT Tirupati, Tirupati<br />
                    Andhra Pradesh – 517619, India
                  </p>
                </div>
                <div className="p-3 bg-background/50 rounded border">
                  <p className="text-sm">
                    <span className="font-semibold">DigiPin:</span> 4TF-9CP-6L27
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* General Contact */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">General Enquiries</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border">
                      <Mail className="h-4 w-4 text-primary" />
                      <a 
                        href="mailto:geo.intel@iittnif.com"
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        geo.intel@iittnif.com
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border">
                      <Phone className="h-4 w-4 text-primary" />
                      <a 
                        href="tel:+919154746805"
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        +91-9154746805
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Research Collaboration */}
          <Card className="glass-card text-center">
            <CardContent className="pt-8">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Research Collaboration</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                We welcome collaboration opportunities with researchers, institutions, and industry partners 
                interested in GNSS-R technology, spatial intelligence, and Earth observation applications.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="https://geo.intel.iittnif.com/people/geo-intel-lab-team">
                  <Button variant="outline" className="border-primary/30">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Complete Team
                  </Button>
                </Link>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-primary to-secondary">
                    Explore Our Portal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}