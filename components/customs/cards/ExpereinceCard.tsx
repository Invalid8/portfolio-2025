import ContentSpan from "@/components/customs/ContentEditSpan";
import { Experience } from "@/types";
import { MapPinIcon, ExternalLinkIcon, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth";

export function ExperienceCard({ experience }: { experience: Experience }) {
  const { isEditing } = useAuth();

  return (
    <div className="group relative bg-neutral-800/30 backdrop-blur border border-neutral-700/50 rounded-2xl p-6 lg:p-8 hover:border-primary/30 hover:bg-neutral-800/50 transition-all">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg text-primary font-medium text-sm mb-4">
            <CalendarIcon className="w-4 h-4" />
            <ContentSpan
              collection="experiences"
              sectionKey={`experience-${experience.id}`}
              fieldKey="position.duration"
            >
              {experience.position.duration}
            </ContentSpan>
          </div>

          <ContentSpan
            collection="experiences"
            sectionKey={`experience-${experience.id}`}
            fieldKey="position.title"
            className="text-xl lg:text-2xl font-bold mb-2"
            as="h3"
          >
            {experience.position.title}
          </ContentSpan>

          <div className="flex flex-wrap items-center gap-2 mb-4 text-neutral-300">
            {!isEditing && experience.company.link ? (
              <Link
                href={experience.company.link}
                target="_blank"
                className="text-primary hover:underline font-medium flex items-center gap-2 group/link"
              >
                {experience.company.name}
                <ExternalLinkIcon className="w-4 h-4 group-hover/link:opacity-100 transition-opacity" />
              </Link>
            ) : isEditing ? (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500 min-w-[60px]">Name:</span>
                  <ContentSpan
                    collection="experiences"
                    sectionKey={`experience-${experience.id}`}
                    fieldKey="company.name"
                    className="text-primary font-medium"
                  >
                    {experience.company.name}
                  </ContentSpan>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500 min-w-[60px]">Link:</span>
                  <ContentSpan
                    collection="experiences"
                    sectionKey={`experience-${experience.id}`}
                    fieldKey="company.link"
                    className="text-primary font-medium flex-1"
                  >
                    {experience.company.link || "https://"}
                  </ContentSpan>
                </div>
              </div>
            ) : (
              <span className="text-primary font-medium">
                {experience.company.name}
              </span>
            )}

            {experience.company.location && (
              <>
                <span className="text-neutral-600">•</span>
                <span className="flex items-center gap-1 text-sm text-neutral-400">
                  <MapPinIcon className="w-4 h-4" />
                  <ContentSpan
                    collection="experiences"
                    sectionKey={`experience-${experience.id}`}
                    fieldKey="company.location"
                  >
                    {experience.company.location}
                  </ContentSpan>
                </span>
              </>
            )}
          </div>

          <ContentSpan
            collection="experiences"
            sectionKey={`experience-${experience.id}`}
            fieldKey="position.role"
            className="text-neutral-300 leading-relaxed"
            as="p"
          >
            {experience.position.role}
          </ContentSpan>
        </div>
      </div>

      {experience.skills && experience.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-neutral-700/50">
          {experience.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 bg-neutral-700/30 text-neutral-300 rounded-full text-xs border border-neutral-600/30 hover:border-primary/50 hover:bg-neutral-700/50 transition-all"
            >
              {skill.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}