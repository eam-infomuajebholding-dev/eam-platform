import Layout from '@/components/Layout';

const teamMembers = [
  {
    name: 'م. عبدالرحمن الأحمد',
    title: 'المدير العام',
    description: 'خبرة تزيد عن 20 عاماً في إدارة المشاريع الهندسية الكبرى والاستشارات الهندسية',
    gradient: 'from-gold-dark to-gold',
  },
  {
    name: 'م. فهد العتيبي',
    title: 'مدير الخدمات الهندسية',
    description: 'متخصص في التصميم المعماري والإنشائي بخبرة 15 عاماً في المشاريع السكنية والتجارية',
    gradient: 'from-blue-600 to-blue-400',
  },
  {
    name: 'م. سارة القحطاني',
    title: 'مديرة الخدمات الحكومية',
    description: 'خبيرة في الإجراءات الحكومية والتراخيص مع خبرة واسعة في التعامل مع الجهات الرسمية',
    gradient: 'from-emerald-600 to-emerald-400',
  },
  {
    name: 'م. خالد الشمري',
    title: 'مدير المشاريع',
    description: 'مهندس مدني متخصص في إدارة وتنفيذ المشاريع الكبرى مع سجل حافل بالإنجازات',
    gradient: 'from-purple-600 to-purple-400',
  },
];

export default function Team() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-[#0c1a36]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.08)_0%,transparent_70%)]" />
        <div className="relative z-10 text-center px-4">
          <h1 className="gold-text text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">فريقنا</h1>
          <p className="text-gray-600 dark:text-white/70 text-lg md:text-xl max-w-2xl mx-auto font-tajawal">
            فريق من المهندسين والخبراء المتخصصين
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 md:py-24 bg-white dark:bg-[#132347]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-14">
            <p className="text-gray-600 dark:text-white/70 text-lg font-tajawal leading-relaxed">
              يضم فريقنا نخبة من المهندسين والمتخصصين ذوي الخبرات الواسعة في مختلف المجالات الهندسية،
              يعملون معاً لتقديم أفضل الحلول والخدمات لعملائنا الكرام.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, i) => (
              <div key={i} className="group text-center p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gold/20 hover:border-gold/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,168,76,0.1)]">
                {/* Avatar */}
                <div className={`w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-3xl font-bold font-tajawal`}>
                  {member.name.charAt(2)}
                </div>
                <h3 className="text-gold font-bold text-lg mb-1 font-tajawal">{member.name}</h3>
                <p className="text-gold-light/70 text-sm mb-3 font-tajawal">{member.title}</p>
                <p className="text-gray-600 dark:text-white/55 text-xs leading-relaxed font-tajawal">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}