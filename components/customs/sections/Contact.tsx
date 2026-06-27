"use client";

import ContentSpan from "@/components/customs/ContentEditSpan";
import { usePageContext } from "@/lib/context/PageContent";
import { useAuth } from "@/lib/context/auth";
import { useState } from "react";
import {
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SendIcon,
  Loader2Icon,
} from "lucide-react";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/constants";
import { toast } from "sonner";

export default function Contact() {
  const { getItem } = usePageContext();
  const { isEditing } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const contactSection = getItem("portfolio", "contact") ?? {
    title: "LET'S WORK TOGETHER",
    subtitle:
      "Have a project in mind? Let's discuss how we can work together to bring your ideas to life.",
    email: "b.fadamitan2019@gmail.com",
    phone: "+234 703 4797 467",
    location: "Lagos, Nigeria",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        "https://formsubmit.co/ajax/b.fadamitan2019@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
            _subject: `New Portfolio Contact from ${formData.name}`,
            _template: "table",
          }),
        },
      );
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Message sent! I'll get back to you soon.");
        setFormData({ name: "", email: "", message: "" });
      } else throw new Error();
    } catch {
      toast.error("Failed to send. Please email me directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="Contact"
      className="relative w-full py-24 px-4 sm:px-8 md:px-12 xl:px-20 overflow-hidden"
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-primary text-xs font-mono tracking-[0.35em] uppercase">
              Contact
            </span>
          </div>
          <ContentSpan
            className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-none tracking-tight"
            itemId="contact"
            fieldKey="title"
            as="h2"
          >
            {contactSection?.title}
          </ContentSpan>
          <ContentSpan
            itemId="contact"
            fieldKey="subtitle"
            as="p"
            className="text-base text-neutral-400 max-w-xl mt-3"
          >
            {contactSection?.subtitle}
          </ContentSpan>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-15 items-start">
          <div className="space-y-8">
            <div className="space-y-4 grid">
              <ContactItem
                icon={<MailIcon className="w-4 h-4" />}
                label="Email"
                value={contactSection?.email}
                href={`mailto:${contactSection?.email}`}
                itemId="contact"
                fieldKey="email"
                isEditing={isEditing}
              />

              <ContactItem
                icon={<MapPinIcon className="w-4 h-4" />}
                label="Location"
                value={contactSection?.location}
                itemId="contact"
                fieldKey="location"
                isEditing={isEditing}
              />
            </div>

            <div className="pt-6 border-t border-neutral-800">
              <p className="text-xs font-mono tracking-widest uppercase text-neutral-600 mb-4">
                Find me on
              </p>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    href={link.link}
                    target="_blank"
                    className="w-11 h-11 rounded-full border border-neutral-800 bg-neutral-900/40 hover:bg-primary hover:border-primary flex items-center justify-center transition-all duration-300 text-sm font-mono font-medium text-neutral-400 hover:text-white hover:scale-110"
                    title={link.name}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="p-7 lg:p-8 rounded-2xl border border-neutral-800/60 bg-neutral-900/30 hover:border-primary/20 transition-all duration-300">
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                {
                  id: "name",
                  label: "Name",
                  type: "text",
                  placeholder: "Your name",
                },
                {
                  id: "email",
                  label: "Email",
                  type: "email",
                  placeholder: "your.email@example.com",
                },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label
                    htmlFor={id}
                    className="block text-xs font-mono tracking-widest uppercase text-neutral-500 mb-3"
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    id={id}
                    name={id}
                    value={formData[id as keyof typeof formData]}
                    onChange={(e) =>
                      setFormData({ ...formData, [id]: e.target.value })
                    }
                    required
                    disabled={loading}
                    placeholder={placeholder}
                    className="w-full h-13 px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-md text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50 placeholder:text-neutral-700"
                  />
                </div>
              ))}

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs font-mono tracking-widest uppercase text-neutral-500 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  disabled={loading}
                  placeholder="Tell me about your project..."
                  className="w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all resize-none disabled:opacity-50 placeholder:text-neutral-700"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3.5 bg-primary text-white rounded-xl text-sm font-mono tracking-wider uppercase hover:bg-primary/90 transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Send Message <SendIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
  itemId,
  fieldKey,
  isEditing,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  itemId: string;
  fieldKey: string;
  isEditing: boolean;
}) {
  const inner = (
    <div className="group flex items-center gap-4 p-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/30 hover:border-primary/30 hover:bg-neutral-900/60 transition-all duration-300">
      <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-800/60 border border-neutral-700/40 text-neutral-400 group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:text-primary transition-all duration-300 flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-mono tracking-widest uppercase text-neutral-600 mb-0.5">
          {label}
        </p>
        <ContentSpan
          as="p"
          itemId={itemId}
          fieldKey={fieldKey}
          className="text-sm text-neutral-300 group-hover:text-primary transition-colors truncate"
        >
          {value}
        </ContentSpan>
      </div>
    </div>
  );

  // don't wrap in Link while editing — it causes nav on click and loses the field
  if (href && !isEditing) {
    return (
      <Link href={href} target="_blank">
        {inner}
      </Link>
    );
  }

  return inner;
}
