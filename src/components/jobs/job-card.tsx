'use client'

import { Job } from '@/lib/types/job'
import { formatDate, formatSalary, getJobTypeLabel, getExperienceLabel, truncateText, getInitials } from '@/lib/actions/utils'
import { MapPin, Clock, DollarSign, ExternalLink, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

interface JobCardProps {
    job: Job
    onViewDetails?: (job: Job) => void
}

export function JobCard({ job, onViewDetails }: JobCardProps) {
    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(job)
        } else {
            window.open(job.url, '_blank')
        }
    }

    return (
        <Card className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="h-4 w-4" />
                            <span className="font-medium">{job.companyName}</span>
                        </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">
                                {getInitials(job.companyName)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                <div className="space-y-3">
                    {/* Location and Remote */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}, {job.country}</span>
                        {job.remote && (
                            <Badge variant="secondary" className="text-xs">
                                Remote
                            </Badge>
                        )}
                    </div>

                    {/* Job Type and Experience */}
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                            {getJobTypeLabel(job.type)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {getExperienceLabel(job.experienceLevel)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {job.source}
                        </Badge>
                    </div>

                    {/* Salary */}
                    {(job.salary || job.salaryMin || job.salaryMax) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
                        </div>
                    )}

                    {/* Posted Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>Posted {formatDate(job.postedAt)}</span>
                    </div>

                    {/* Description Preview */}
                    <p className="text-sm text-gray-600 line-clamp-3">
                        {truncateText(job.description, 120)}
                    </p>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {job.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                </Badge>
                            ))}
                            {job.skills.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{job.skills.length - 3} more
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-0">
                <Button
                    onClick={handleViewDetails}
                    className="w-full"
                    variant="default"
                >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Job
                </Button>
            </CardFooter>
        </Card>
    )
}
