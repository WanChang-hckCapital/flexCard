
import ContactForm from '@/components/forms/contact-us';
import { getDictionary } from '../../dictionaries';

export default async function ContactUs({ params }: { params: { lang: string } }) {
    const dict = await getDictionary(params.lang);
    
    return (
        <div className="flex justify-center items-center min-h-screen p-4 bg-slate-50 dark:bg-slate-900">
            <ContactForm dict={dict}/>
        </div>
    );
}
