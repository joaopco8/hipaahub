import { Card, CardHeader, CardContent } from '@/components/ui/card-header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { testimonials } from '@/config/testimonials';

export default function Testimonials() {
  const groupedTestimonials = [];
  for (let i = 0; i < testimonials.length; i += 4) {
    groupedTestimonials.push(testimonials.slice(i, i + 4));
  }

  return (
    <section className="relative w-full bg-[#f3f5f9] py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="flex items-center w-full max-w-7xl mx-auto mb-12">
          <div className="flex-grow border-t border-[#0d1122]/10"></div>
          <div className="flex-shrink px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-geologica font-light text-[#0d1122] mb-2">Testimonials</h2>
            <p className="text-[#0d1122]/70 font-geologica font-light">
              What everyone else is saying
            </p>
          </div>
          <div className="flex-grow border-t border-[#0d1122]/10"></div>
        </div>
        <div className="flex flex-wrap w-full max-w-7xl mx-auto">
          {groupedTestimonials.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="flex flex-col w-full md:w-1/3 p-2 h-fit"
            >
              {group.map((testimonial, index) => (
                <Card key={index} className="mb-4 h-full border border-[#0d1122]/10 bg-white">
                  <CardHeader className="flex flex-row items-center bg-gray-50 p-3 rounded-t-xl">
                    <div className="flex items-center">
                      <Avatar className="size-7 mr-2">
                        <AvatarImage src={testimonial.avatarImg} className="h-full w-full" />
                        <AvatarFallback className="h-full w-full">
                          {testimonial.avatarFallback}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <h3 className="text-sm font-geologica font-medium text-[#0d1122]">{testimonial.name}</h3>
                        <p className="text-xs text-[#0d1122]/60 font-geologica font-light">{testimonial.title}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-[#0d1122]/70 font-geologica font-light leading-relaxed">{testimonial.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
