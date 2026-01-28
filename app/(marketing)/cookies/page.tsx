import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        <div className="container mx-auto px-6 py-24 max-w-4xl">
          {/* Back Link */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-[#1ad07a] transition-colors mb-8 font-extralight"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#0c0b1d] font-extralight leading-tight">
              Cookie Policy
            </h1>
            <p className="text-lg text-zinc-600 font-extralight">
              Last updated: January 23, 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">What Are Cookies</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Types of Cookies We Use</h2>
              
              <h3 className="text-xl text-[#0c0b1d] font-extralight mb-3">Essential Cookies</h3>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                These cookies are necessary for the platform to function properly. They enable core functionality such as:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-6">
                <li>User authentication and session management</li>
                <li>Security and fraud prevention</li>
                <li>Load balancing and performance optimization</li>
              </ul>

              <h3 className="text-xl text-[#0c0b1d] font-extralight mb-3">Performance Cookies</h3>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously. They help us:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-6">
                <li>Analyze site traffic and usage patterns</li>
                <li>Identify and fix technical issues</li>
                <li>Improve platform performance</li>
              </ul>

              <h3 className="text-xl text-[#0c0b1d] font-extralight mb-3">Functional Cookies</h3>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                These cookies enable enhanced functionality and personalization, such as:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-6">
                <li>Remembering your preferences and settings</li>
                <li>Saving your progress in forms and workflows</li>
                <li>Providing customized content</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Third-Party Cookies</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                We use trusted third-party services that may set cookies on your device:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-4">
                <li><strong className="font-medium text-[#0c0b1d]">Stripe:</strong> For secure payment processing</li>
                <li><strong className="font-medium text-[#0c0b1d]">Analytics:</strong> To understand platform usage and improve our services</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Managing Cookies</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                You can control and manage cookies in several ways:
              </p>
              
              <h3 className="text-xl text-[#0c0b1d] font-extralight mb-3">Browser Settings</h3>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-6">
                <li>View and delete cookies</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>

              <h3 className="text-xl text-[#0c0b1d] font-extralight mb-3">Cookie Consent</h3>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                When you first visit HIPAA Hub, you'll see a cookie consent banner. You can manage your preferences at any time by accessing the cookie settings in the footer of our website.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Impact of Disabling Cookies</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                Please note that blocking essential cookies may impact your ability to use certain features of the platform. Specifically, you may not be able to:
              </p>
              <ul className="list-disc pl-6 text-zinc-700 font-extralight space-y-2 mb-4">
                <li>Log in to your account</li>
                <li>Save your preferences</li>
                <li>Access certain compliance tools</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Cookie Duration</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device for a set period or until you delete them).
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Updates to This Policy</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements. We will notify you of any significant changes by posting the new policy on this page.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl text-[#0c0b1d] font-extralight mb-4">Contact Us</h2>
              <p className="text-zinc-700 font-extralight leading-relaxed mb-4">
                If you have questions about our use of cookies, please contact us at:
              </p>
              <p className="text-zinc-700 font-extralight leading-relaxed">
                Email: <a href="mailto:hello@hipaahub.com" className="text-[#1ad07a] hover:underline">hello@hipaahub.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
