"use client";

import Link from "next/link";
import { JobCard } from "../jobs/job-card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Briefcase, TrendingUp, MapPin, Users } from "lucide-react";
import { Job } from "@/lib/types/job";

export function Startpage({ jobs }: { jobs?: Job[] | null }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Find Your Dream Tech Job in Africa
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with top African tech companies and build your career in the
            fastest-growing tech ecosystem on the continent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/jobs">
                <Briefcase className="mr-2 h-5 w-5" />
                Browse Jobs
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8"
            >
              <Link href="/jobs/new">Post a Job</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-card rounded-sm p-6 border">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-primary mr-4" />
              <div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-sm p-6 border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary mr-4" />
              <div>
                <p className="text-2xl font-bold">200+</p>
                <p className="text-muted-foreground">Companies</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-sm p-6 border">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-primary mr-4" />
              <div>
                <p className="text-2xl font-bold">25+</p>
                <p className="text-muted-foreground">Countries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      {jobs && jobs.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <TrendingUp className="mr-2 h-4 w-4" />
              Featured Jobs
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Latest Opportunities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the most exciting tech roles from leading African
              companies
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {jobs.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/jobs">View All Jobs</Link>
            </Button>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Hire Top Talent?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join hundreds of African tech companies finding the best developers
            and tech professionals
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="text-lg px-8"
          >
            <Link href="/jobs/new">Post Your Job Opening</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
