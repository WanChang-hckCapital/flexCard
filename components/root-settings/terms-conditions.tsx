// pages/terms.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import MaxWContainer from "@/components/max-w-container";
import Link from "next/link";
import { Label } from "../ui/label";

export default function TermsConditions() {
  const [activeSection, setActiveSection] = useState("whatWeCollect");

  const sections = [
    { id: "whatWeCollect", title: "What Information We Collect" },
    { id: "infoFromOtherSources", title: "Information From Other Sources" },
    { id: "autoCollectInfo", title: "Automatically Collected Information" },
    { id: "howWeUseYourInfo", title: "How We Use Your Information" },
    {
      id: "weGenerallyUseInfo",
      title: "We generally use the Information We Collect",
    },
    { id: "howWeShareYourInfo", title: "How We Share Your Information" },
    {
      id: "serviceProviders",
      title: "Service Providers and Business Partners",
    },
    { id: "withinGroup", title: "Within Our Corporate Group" },
    { id: "legalResons", title: "For Legal Reasons" },
    { id: "withConsent", title: "With Your Consent" },
    { id: "yourRights", title: "Your Rights" },
    { id: "yourChoices", title: "Your Choices" },
    { id: "dataSecurity", title: "Data Security and Retention" },
    { id: "childrenTeens", title: "Children and Teens" },
    { id: "other", title: "Other Rights" },
    { id: "underAge", title: "Content Removal for Users Under 18" },
    { id: "privacy", title: "Privacy Policy Updates" },
    { id: "contactUs", title: "Contact Us" },
  ];

  return (
    <div className="flex min-h-[90vh] p-6">
      <aside className="w-1/4 pr-4 border-r border-gray-200 dark:border-gray-800 max-md:overflow-y-scroll max-h-[88vh]">
        <ul className="space-y-2">
          {sections.map((section) => (
            <li
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`pl-4 py-1 cursor-pointer transition-all ${
                activeSection === section.id
                  ? "border-l-4 border-red-600 text-white"
                  : "border-l-4 border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
            >
              <span className="block text-[12px] font-semibold">
                {section.title}
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="w-3/4 px-6 overflow-y-scroll max-h-[88vh]">
        <h1 className="text-3xl font-bold mb-6 text-white">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-4">Last updated: Aug 19, 2024</p>
        <div className="text-justify">
          {activeSection === "whatWeCollect" && (
            <section>
              <p className="text-gray-300">
                This Privacy Policy applies to flxBubble services (the
                “Platform”), which include flxBubble apps, websites, software
                and related services accessed via any platform or device that
                link to this Privacy Policy. The Platform is provided and
                controlled by HCK Capital Technologies Ltd. (“flxBubble”, “we”
                or “us”). We are committed to protecting and respecting your
                privacy. This Privacy Policy explains how we collect, use,
                share, and otherwise process the personal information of users
                and other individuals age 13 and over in connection with our
                Platform. For information about how we collect, use, share, and
                otherwise process the personal information of users under age 13
                (“Children”), please refer to our Children&apos;s Privacy
                Policy. For information about how we collect, use, share, and
                otherwise process consumer health data as defined under
                Washington&apos;s My Health My Data Act and other similar state
                laws, please refer to the Consumer Health Data Privacy Policy.
              </p>
              <br />
              <p className="text-gray-300">
                Capitalized terms that are not defined in this Privacy Policy
                have the meaning given to them in the Terms of Service.
              </p>
              <br />
              <h2 className="text-2xl font-bold mb-4 text-white">
                What Information We Collect
              </h2>
              <p className="text-gray-300">
                We may collect information from and about you, including
                information that you provide, information from other sources,
                and automatically collected information.
              </p>
              <h2 className="text-2xl font-bold mb-4 mt-4 text-white">
                Information You Provide
              </h2>
              <p className="text-gray-300">
                When you create an account, upload content, contact us directly,
                or otherwise use the Platform, you may provide some or all of
                the following information:
                <br />
                Account and profile information, such as name, age, username,
                password, language, email, phone number, social media account
                information, and profile image. User-generated content,
                including comments, photographs, livestreams, audio recordings,
                videos, text, hashtags, and virtual item videos that you choose
                to create with or upload to the Platform (“User Content”) and
                the associated metadata, such as when, where, and by whom the
                content was created.
                <br />
                <br />
                Even if you are not a user, information about you may appear in
                User Content created or published by users on the Platform. When
                you create User Content, we may upload or import it to the
                Platform before you save or post the User Content (also known as
                pre-uploading), for example, in order to recommend audio
                options, generate captions, and provide other personalized
                recommendations.
                <br />
                <br />
                If you apply an effect to your User Content, we may collect a
                version of your User Content that does not include the effect.
                Messages, which include information you provide when you
                compose, send, or receive messages through the Platform&apos;s
                messaging functionalities. They include messages you send
                through our chat functionality when communicating with sellers
                who sell goods to you, and your use of virtual assistants when
                purchasing items through the Platform. That information includes
                the content of the message and information about the message,
                such as when it was sent, received, or read, and message
                participants.
                <br />
                <br />
                Please be aware that messages you choose to send to other users
                of the Platform will be accessible by those users and that we
                are not responsible for the manner in which those users use or
                share the messages. Information, including text, images, and
                videos, found in your device&apos;s clipboard, with your
                permission. For example, if you choose to initiate information
                sharing with a third-party platform, or choose to paste content
                from the clipboard onto the Platform, we access this information
                stored in your clipboard in order to fulfill your request.
                Purchase information, including payment card numbers or other
                third-party payment information (such as PayPal) where required
                for the purpose of payment, and billing and shipping address.
                <br />
                <br />
                We also collect information that is required for extended
                warranty purposes and your transaction and purchase history on
                or through the Platform. Your phone and social network contacts,
                with your permission. If you choose to find other users through
                your phone contacts, we will access and collect information such
                as names, phone numbers, and email addresses, and match that
                information against existing users of the Platform.
                <br />
                <br />
                If you choose to find other users through your social network
                contacts, we will collect your public profile information as
                well as names and profiles of your social network contacts. Your
                choices and communication preferences. Information to verify an
                account such as proof of identity or age. Information in
                correspondence you send to us, including when you contact us for
                support. Information you share through surveys or your
                participation in challenges, research, promotions, marketing
                campaigns, events, or contests such as your gender, age,
                likeness, and preferences.
              </p>
            </section>
          )}
          {activeSection === "infoFromOtherSources" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Information From Other Sources
              </h2>
              <p className="text-gray-300">
                We may receive the information described in this Privacy Policy
                from other sources, such as:
                <br />
                If you choose to sign-up or log-in to the Platform using a
                third-party service such as Facebook, Twitter, Instagram, or
                Google, or link your flxBubble account to a third-party service,
                we may collect information from the service&ndash;for example,
                your public profile information (such as nickname), email, and
                contact list. Advertisers, measurement and other partners share
                information with us about you and the actions you have taken
                outside of the Platform, such as your activities on other
                websites and apps or in stores, including the products or
                services you purchased, online or in person. These partners also
                share information with us, such as mobile identifiers for
                advertising, hashed email addresses and phone numbers, and
                cookie identifiers, which we use to help match you and your
                actions outside of the Platform with your flxBubble account.
                Some of our advertisers and other partners enable us to collect
                similar information directly from their websites or apps by
                integrating our flxBubble Advertiser Tools (such as flxBubble
                Pixel). We may obtain information about you from certain
                affiliated entities within our corporate group, including about
                your activities on their platform.
                <br />
                <br />
                We may receive information about you from others, including
                where you are included or mentioned in User Content, direct
                messages, in a complaint, appeal, request or feedback submitted
                to us, or if your contact information is provided to us. We may
                also collect or receive information about you from
                organizations, businesses, people, and others, including, for
                example, publicly available sources, government authorities,
                professional organizations, and charity groups.
              </p>
            </section>
          )}
          {activeSection === "autoCollectInfo" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Automatically Collected Information
              </h2>
              <p className="text-gray-300">
                We automatically collect certain information from you when you
                use the Platform, including internet or other network activity
                information such as your IP address, geolocation-related data,
                unique device identifiers, browsing and search history
                (including content you have viewed in the Platform), and
                Cookies.
                <br />
                <br />
                Usage Information. We collect information regarding your use of
                the Platform and any other User Content that you generate
                through or upload to our Platform. Device Information. We
                collect certain information about the device you use to access
                the Platform, such as your IP address, user agent, mobile
                carrier, time zone settings, identifiers for advertising
                purposes, model of your device, the device system, network type,
                device IDs, your screen resolution and operating system, app and
                file names and types, keystroke patterns or rhythms, battery
                state, audio settings and connected audio devices. We
                automatically assign you a device ID and user ID. Where you
                log-in from multiple devices, we will be able to use information
                such as your device ID and user ID to identify your activity
                across devices. We may also associate you with information
                collected from devices other than those you use to log-in to the
                Platform.
                <br />
                <br />
                Location Data. We collect information about your approximate
                location, including location information based on your SIM card
                and/or IP address. In addition, we collect location information
                (such as tourist attractions, shops, or other points of
                interest) if you choose to add the location information to your
                User Content. Current versions of the app do not collect precise
                or approximate GPS information from U.S. users. If you are still
                using an older version that allowed for collection of precise or
                approximate GPS information (last release in August 2020) and
                you granted us permission to do so, we may collect such
                information. Image and Audio Information. We may collect
                information about the videos, images and audio that are a part
                of your User Content, such as identifying the objects and
                scenery that appear, the existence and location within an image
                of face and body features and attributes, the nature of the
                audio, and the text of the words spoken in your User Content. We
                may collect this information to enable special video effects,
                for content moderation, for demographic classification, for
                content and ad recommendations, and for other
                non-personally-identifying operations. We may collect biometric
                identifiers and biometric information as defined under U.S.
                laws, such as faceprints and voiceprints, from your User
                Content. Where required by law, we will seek any required
                permissions from you prior to any such collection. Click here to
                learn more.
                <br />
                <br />
                Metadata. When you upload or create User Content, you
                automatically upload certain metadata that is connected to the
                User Content. Metadata describes other data and provides
                information about your User Content that will not always be
                evident to the viewer. For example, in connection with your User
                Content the metadata can describe how, when, where, and by whom
                the piece of User Content was created, collected, or modified
                and how that content is formatted. It also includes information,
                such as your account name, that enables other users to trace
                back the User Content to your user account. Additionally,
                metadata includes data that you choose to provide with your User
                Content, e.g., any hashtags used to mark keywords to the video
                and captions.
                <br />
                <br />
                Cookies. We and our service providers and business partners use
                cookies and other similar technologies (e.g., web beacons, flash
                cookies, etc.) (“Cookies”) to automatically collect information,
                measure and analyze how you use the Platform, including which
                pages you view most often and how you interact with content,
                enhance your experience using the Platform, improve the
                Platform, provide you with advertising, and measure the
                effectiveness of advertisements and other content. We and our
                partners also use Cookies to promote the Platform on other
                platforms and websites. Cookies enable the Platform to provide
                certain features and functionality. Web beacons are very small
                images or small pieces of data embedded in images, also known as
                “pixel tags” or “clear GIFs,” that can recognize Cookies, the
                time and date a page is viewed, a description of the page where
                the pixel tag is placed, and similar information from your
                computer or device. To learn how to disable certain Cookies, see
                the “Your Choices” section below.
                <br />
                <br />
                We may link your contact or account information with your
                activity on and off our Platform across all your devices, using
                your email or other log-in or device information. We may use
                this information to display advertisements on our Platform
                tailored to your interests, preferences, and characteristics.
                <br />
                <br />
                We are not responsible for the privacy practices of our service
                providers and business partners, and the information practices
                of these service providers and business partners are not covered
                by this Privacy Policy.
                <br />
                <br />
                We may aggregate or de-identify the information described above.
                Aggregated or de-identified data is not subject to this Privacy
                Policy.
              </p>
            </section>
          )}
          {activeSection === "howWeUseYourInfo" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                How We Use Your Information
              </h2>
              <p className="text-gray-300">
                As explained below, we use your information to improve, support
                and administer the Platform, to allow you to use its
                functionalities, and to fulfill and enforce our Terms of
                Service. We may also use your information to, among other
                things, show you suggestions, promote the Platform, and
                customize your ad experience.
              </p>
            </section>
          )}
          {activeSection === "weGenerallyUseInfo" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                We generally use the Information We Collect
              </h2>
              <p className="text-gray-300">
                To fulfill requests for products, services, Platform
                functionality, support and information for internal operations,
                including troubleshooting, data analysis, testing, research,
                statistical, and survey purposes and to solicit your feedback.
                <br />
                To customize the content you see when you use the Platform. For
                example, we may provide you with services based on the country
                settings you have chosen or show you content that is similar to
                content that you have liked or interacted with.
                <br />
                To send promotional materials from us or on behalf of our
                affiliates and trusted third parties. To improve and develop our
                Platform and conduct product development.
                <br />
                To measure and understand the effectiveness of the
                advertisements we serve to you and others and to deliver
                advertising, including targeted advertising, to you on the
                Platform.
                <br />
                To make suggestions and provide a customized ad experience.
                <br />
                To support the social functions of the Platform, including to
                permit you and others to connect with each other (for example,
                through our Find Friends function), to suggest accounts to you
                and others, and for you and others to share, download, and
                otherwise interact with User Content posted through the
                Platform.
                <br />
                To use User Content as part of our advertising and marketing
                campaigns to promote the Platform.
                <br />
                To understand how you use the Platform, including across your
                devices.
                <br />
                To infer additional information about you, such as your age,
                gender, and interests.
                <br />
                To help us detect abuse, fraud, and illegal activity on the
                Platform.
                <br />
                To promote the safety and security of the Platform, including by
                scanning, analyzing, and reviewing User Content, messages and
                associated metadata for violations of our Terms of Service,
                Community Guidelines, or other conditions and policies.
                <br />
                To verify your identity in order to use certain features, such
                as livestream or verified accounts, or when you apply for a
                Business Account, to ensure that you are old enough to use the
                Platform (as required by law), or in other instances where
                verification may be required.
                <br />
                To communicate with you, including to notify you about changes
                in our services. To announce you as a winner of our contests or
                promotions if permitted by the promotion rule, and to send you
                any applicable prizes.
                <br />
                To enforce our Terms of Service, Community Guidelines, and other
                conditions and policies. Consistent with your permissions, to
                provide you with location-based services, such as advertising
                and other personalized content.
                <br />
                To train and improve our technology, such as our machine
                learning models and algorithms. To combine all the Information
                We Collect or receive about you for any of the foregoing
                purposes.
                <br />
                To facilitate sales, promotion, and purchases of goods and
                services and to provide user support.
                <br />
                For any other purposes disclosed to you at the time we collect
                your information or pursuant to your consent.
                <br />
                Profiling: We do not engage in profiling which results in legal
                or similarly significant effects, as defined under applicable
                law.
              </p>
            </section>
          )}
          {activeSection === "howWeShareYourInfo" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                How We Share Your Information
              </h2>
              <p className="text-gray-300">
                We are committed to maintaining your trust, and while flxBubble
                does not sell your personal information or share your personal
                information with third parties for purposes of cross-context
                behavioral advertising where restricted by applicable law, we
                want you to understand when and with whom we may share the
                Information We Collect for business purposes.
              </p>
            </section>
          )}
          {activeSection === "serviceProviders" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Service Providers and Business Partners
              </h2>
              <p className="text-gray-300">
                We share the categories of personal information listed above
                with service providers and business partners to help us perform
                business operations and for business purposes, including
                research, payment processing and transaction fulfillment,
                database maintenance, administering contests and special offers,
                technology services, deliveries, sending communications,
                advertising and marketing services, analytics, measurement, data
                storage and hosting, disaster recovery, search engine
                optimization, and data processing. These service providers and
                business partners may include:
                <br />
                <br />
                Payment processors and transaction fulfillment providers, who
                may receive the Information You Provide, Information From Other
                Sources, and Automatically Collected Information but who do not
                receive your message data, including, in particular, the
                following third-party payment providers/processors: PayPal
                (https://www.paypal.com/us/webapps/mpp/ua/privacy-full) and
                Stripe (https://stripe.com/en-ie/privacy).
                <br />
                <br />
                Customer and technical support providers, who may receive the
                Information You Provide, Information From Other Sources, and
                Automatically Collected Information. Researchers who may receive
                the Information You Provide, Information From Other Sources, and
                Automatically Collected Information but would not receive your
                payment information or message data.
                <br />
                <br />
                Advertising, marketing, and analytics vendors, who may receive
                the Information You Provide, Information From Other Sources, and
                Automatically Collected Information but would not receive your
                payment information or message data.
              </p>
            </section>
          )}
          {activeSection === "withinGroup" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Within Our Corporate Group
              </h2>
              <p className="text-gray-300">
                As a global company, the Platform is supported by certain
                entities within our corporate group, which are given limited
                remote access to Information We Collect as necessary to enable
                them to provide certain important functions. To learn more about
                how we share information with certain corporate group entities,
                see here.
                <br />
                <br />
                In Connection with a Sale, Merger, or Other Business Transfer We
                may share all of the Information We Collect in connection with a
                substantial corporate transaction, such as the sale of a
                website, a merger, consolidation, asset sales, or in the
                unlikely event of bankruptcy.
              </p>
            </section>
          )}
          {activeSection === "legalResons" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                For Legal Reasons
              </h2>
              <p className="text-gray-300">
                We may disclose any of the Information We Collect to respond to
                subpoenas, court orders, legal process, law enforcement
                requests, legal claims, or government inquiries, and to protect
                and defend the rights, interests, safety, and security of the
                Platform, our affiliates, users, or the public. We may also
                share any of the Information We Collect to enforce any terms
                applicable to the Platform, to exercise or defend any legal
                claims, and comply with any applicable law.
              </p>
            </section>
          )}
          {activeSection === "withConsent" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                With Your Consent
              </h2>
              <p className="text-gray-300">
                We may share your information for other purposes pursuant to
                your consent or at your direction.
                <br />
                <br />
                We partner with third-party services (such as Facebook,
                Instagram, Twitter, and Google) to offer you a seamless sign-up,
                log-in, and content-sharing experience. We may share information
                about you with these third-party services if you choose to use
                these features. For example, the services may receive
                information about your activity on the Platform and may notify
                your connections on the third-party services about your use of
                the Platform, in accordance with their privacy policies. If you
                choose to allow a third-party service to access your account, we
                will share certain information about you with the third party.
                Depending on the permissions you grant, the third party may be
                able to obtain your account information and other information
                you choose to provide.
                <br />
                <br />
                If you choose to engage in public activities on the Platform,
                you should be aware that any information you share may be read,
                collected, or used by other users. You should use caution in
                disclosing personal information while using the Platform. We are
                not responsible for the information you choose to submit.
                <br />
                <br />
                When you make a purchase from a third party on the Platform,
                including from a seller selling products through our shopping
                features, we share the information related to the transaction
                with that third party and their service providers and
                transaction fulfillment providers. By making the purchase, you
                are directing us to share your information in this way. These
                entities may use the information shared in accordance with their
                privacy policies.
              </p>
            </section>
          )}
          {activeSection === "yourRights" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Your Rights
              </h2>
              <p className="text-gray-300">
                You may submit a request to know, access, correct or delete the
                information we have collected from or about you at
                https://www.flxBubble.com/legal/report/privacy. You may appeal
                any decision we have made about your request by following the
                instructions in the communication you receive from us notifying
                you of our decision. You may also exercise your rights to know,
                access, correct, delete, or appealby sending your request to the
                physical address provided in the “Contact Us” section below. You
                can also update your account information directly through your
                in-app settings, as well as request a copy of your flxBubble
                data or request to deactivate by following the instructions here
                or delete your account by following the instructions here.
                <br />
                <br />
                You may be entitled, in accordance with applicable law, to
                submit a request through an authorized agent. To designate an
                authorized agent to exercise choices on your behalf, please
                provide evidence that you have given such agent power of
                attorney or that the agent otherwise has valid written authority
                to submit requests to exercise rights on your behalf. We will
                respond to your request consistent with applicable law and
                subject to proper verification. We will verify your request by
                asking you to send it from the email address associated with
                your account or to provide information necessary to verify your
                account.
                <br />
                <br />
                More information about requests that we received can be found
                here.
                <br />
                <br />
                While some of the information that we collect, use, and disclose
                may constitute sensitive personal information under applicable
                state privacy laws, such as information from users under the
                relevant age threshold, information you disclose in survey
                responses or in your User Content about your racial or ethnic
                origin, national origin, religious beliefs, mental or physical
                health diagnosis, sexual life or sexual orientation, status as
                transgender or nonbinary, citizenship or immigration status, or
                financial information, we only process such information in order
                to provide the Platform and within other exemptions under
                applicable law. For example, we may process your financial
                information in order to provide you the goods or services you
                request from us or your driver&apos;s license number in order to
                verify your identity.
              </p>
            </section>
          )}
          {activeSection === "yourChoices" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Your Choices
              </h2>
              <p className="text-gray-300">
                You may be able to control some of the Information We Collect
                through your device browser settings to refuse or disable
                Cookies. Because each browser is different, please consult the
                instructions provided by your browser. Please note that you may
                need to take additional steps to refuse or disable certain types
                of Cookies. In addition, your choice to disable Cookies is
                specific to the particular browser or device that you are using
                when you disable Cookies, so you may need to separately disable
                Cookies for each type of browser or device. If you choose to
                refuse, disable, or delete Cookies, some of the functionality of
                the Platform may no longer be available to you. Without this
                information, we are not able to provide you with all of the
                requested services.
                <br />
                <br />
                You can navigate to &quot;Ads&quot; in your in-app settings to
                opt-out of targeted advertising based on personal information
                about your activity on nonaffiliated apps and websites.
                <br />
                <br />
                You may be able to manage third-party advertising preferences
                for some of the third parties we work with to serve advertising
                across the Internet by using the choices available at
                https://www.networkadvertising.org/managing/opt_out.asp and
                https://www.aboutads.info/choices.
                <br />
                <br />
                Your device may have controls that determine what Information We
                Collect. For example, you can control whether we can collect
                your mobile advertising identifier for advertising through
                settings on your Apple and Android devices.
                <br />
                <br />
                You can opt out of marketing or advertising emails by using the
                “unsubscribe” link or mechanism noted in marketing or
                advertising emails.
                <br />
                <br />
                Current versions of the app do not collect precise or
                approximate GPS information from U.S. users. If you are still
                using an older version that allowed for collection of precise or
                approximate GPS information (last release in August 2020) and
                you granted us permission to do so, you can prevent your device
                from sharing such information with the Platform at any time
                through your device’s operating system settings.
                <br />
                <br />
                If you have registered for an account, you may access, review,
                and update certain personal information that you have provided
                to us by logging into your account and using available features
                and functionalities.
                <br />
                <br />
                Some browsers transmit “do-not-track” signals to websites.
                Because of differences in how browsers incorporate and activate
                this feature, we currently do not take action in response to
                these signals.
              </p>
            </section>
          )}
          {activeSection === "dataSecurity" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Data Security and Retention
              </h2>
              <p className="text-gray-300">
                We use reasonable measures to help protect information from
                loss, theft, misuse, unauthorized access, disclosure,
                alteration, or destruction. You should understand that no data
                storage system or transmission of data over the Internet or any
                other public network can be guaranteed to be 100 percent secure.
                Please note that information collected by third parties may not
                have the same security protections as information you submit to
                us, and we are not responsible for protecting the security of
                such information.
                <br />
                <br />
                We retain information for as long as necessary to provide the
                Platform and for the other purposes set out in this Privacy
                Policy. We also retain information when necessary to comply with
                contractual and legal obligations, when we have a legitimate
                business interest to do so (such as improving and developing the
                Platform, and enhancing its safety, security and stability), and
                for the exercise or defense of legal claims.
                <br />
                <br />
                The retention periods are different depending on different
                criteria, such as the type of information and the purposes for
                which we use the information. For example, when we process your
                information such as your profile information to provide you with
                the Platform, we keep this information for as long as you have
                an account. If you violate our Terms of Service, Community
                Guidelines, or other conditions or policies, we may remove your
                profile immediately, but may keep other information about you to
                process the violation.
                <br />
                <br />
                flxBubble may transmit your data to its servers or data centers
                outside of the United States for storage and/or processing.
                Other entities with whom flxBubble may share your data as
                described herein may be located outside of the United States.
              </p>
            </section>
          )}
          {activeSection === "childrenTeens" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Children and Teens
              </h2>
              <p className="text-gray-300">
                The privacy of Children is important to us. We provide a
                separate experience for Children in the United States, in which
                we collect and process only limited information. For information
                about how we collect, use, share, and otherwise process the
                personal information of Children, please refer to our
                Children&apos;s Privacy Policy.
                <br />
                <br />
                The Platform otherwise is not directed at Children. If we become
                aware that personal information has been collected on the
                Platform from a Child, we will delete this information and
                terminate the Child&apos;s account. If you believe there is a
                user who is below the age of 13, please contact us at:
                https://www.flxBubble.com/legal/report/feedback.
                <br />
                <br />
                If you are a parent or guardian, our Guardian&quot;s Guide
                contains information and resources to help you understand the
                Platform and the tools and controls you can use. As a parent or
                guardian, you can also request the deletion of the account of
                your underage child or download the account data of your
                underage child by contacting us at
                https://www.flxBubble.com/legal/report/privacy.
                <br />
                <br />
                If you are a parent or guardian, depending on your state of
                residence, you may have the ability to exercise certain rights
                over your child&quot;s or teen&quot;s account. For example, you
                may request the deletion of their accounts, download account
                data, or exercise other rights in connection with your child or
                teen by contacting us at
                https://www.flxBubble.com/legal/report/privacy. We will address
                these requests in accordance with applicable law.
              </p>
            </section>
          )}
          {activeSection === "other" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Other Rights
              </h2>
              <p className="text-gray-300">
                Sharing for Direct Marketing Purposes (Shine the Light) If you
                are a California resident, once a calendar year, you may be
                entitled to obtain information about personal information that
                we shared, if any, with other businesses for their own direct
                marketing uses. To submit a request, contact us at:
                https://www.flxBubble.com/legal/report/privacy.
              </p>
            </section>
          )}
          {activeSection === "underAge" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Content Removal for Users Under 18
              </h2>
              <p className="text-gray-300">
                Users of the Platform who are California residents and are under
                18 years of age may request and obtain removal of User Content
                they posted by contacting us at:
                <br />
                https://www.flxBubble.com/legal/report/privacy. All requests
                must provide a description of the User Content you want removed
                and information reasonably sufficient to permit us to locate
                that User Content. We do not accept California Removal Requests
                via postal mail, telephone, or facsimile. We may not be able to
                respond if you do not provide adequate information. Please note
                that your request does not ensure complete or comprehensive
                removal of the material. For example, User Content that you have
                posted may be republished or reposted by another user.
                <br />
                <br />
                Users of the Platform who are Connecticut residents and are
                under 18 years of age, and parents and guardians of users of the
                Platform who are Connecticut residents under 16 years of age,
                may request that we unpublish or delete their own account (for
                users aged 13 through 17) or their child&apos;s account (for
                parents and guardians with teen users under 16) by following the
                instructions here.
              </p>
            </section>
          )}
          {activeSection === "privacy" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">
                Privacy Policy Updates
              </h2>
              <p className="text-gray-300">
                We may update this Privacy Policy from time to time. When we
                update the Privacy Policy, we will notify you by updating the
                “Last Updated” date at the top of the new Privacy Policy,
                posting the new Privacy Policy, or providing any other notice
                required by applicable law. We recommend that you review the
                Privacy Policy each time you visit the Platform to stay informed
                of our privacy practices.
              </p>
            </section>
          )}
          {activeSection === "contactUs" && (
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Contact Us</h2>
              <p className="text-gray-300">
                Questions, comments and requests regarding this Privacy Policy
                should be addressed to:
                <br />
                <br />
                Contact us: https://www.flxBubble.com/legal/report/privacy
                Mailing Address: HCK Capital Technologies Ltd., Attn: Privacy
                Policy Inquiry, 5800 Bristol Parkway, Suite 100, Culver City, CA
                90230
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
