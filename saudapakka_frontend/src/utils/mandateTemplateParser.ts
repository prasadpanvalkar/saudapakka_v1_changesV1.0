import { Mandate, BrokerProfile, InitiatedBy, DealType } from "@/types/mandate";

// Hardcoded template content 
const TEMPLATE_TEXT = `* MANDATE LETTER(Marketing Authority) *
    ---
* Date:* [Insert Date]

    * To,*
* [Developer / Owner Name] *
* [Project Name –] *
* [Address of Project] *
* [City, State, PIN] *

    Dear * [Sir / Madam / Mr.XYZ] *,

* Re: Appointment as Exclusive / Non - Exclusive Marketing Partner for Sale / Lease of Property *

    ---

    1. * Appointment *
    We, * [Developer / Owner Name] *, hereby appoint * [Marketing Partner Name –] * (hereinafter referred to as *“the Marketing Partner”*), for 90 days with effect from * [Start Date] * until * [End Date] * (unless terminated earlier as per clause 5), as * [Exclusive / Non - Exclusive] * marketing and sales partner for the property detailed below.

2. * Property Details *
    - * Project:* [Project Name –]
        - * Flat Type:* [Flat Type]
            - * Carpet / Saleable Area:* [Area]
                - * Floor:* [Floor]
                    - * Location:* [Full Address]

3. * Authority Granted *
    - * Marketing & Promotion:* Design, develop and execute all marketing campaigns(digital, print, hoarding, events).
- * Lead Generation & Show‑Flat Visits:* Arrange site visits, manage inquiries, and follow‑up with prospective buyers.
- * Negotiation:* Negotiate sale / lease terms within the price band approved by Owner.
- * Documentation Support:* Assist in preparation of sale agreements, application forms, and related paperwork(subject to Owner’s final approval).

4. * Commission & Payment Terms *
    - * Commission Rate:* * [2 %] * of the total sale / lease consideration or a fixed amount of *₹[Amount] *.
- * Payment Schedule:* Within * [7] * days of receipt of full payment from buyer / tenant.
- * TDS & GST:* As applicable per law.

5. * Term & Termination *
    - * Term:* 90 Days From * [Start Date] * to * [End Date] *.
- * Early Termination:* Either party may terminate with * [30] days’* written notice.


6. * Confidentiality *
    All information exchanged shall remain confidential and used solely for the purpose of this mandate.

7. * Governing Law & Dispute Resolution *
    This mandate shall be governed by the laws of * [India] * and any disputes shall be resolved amicably; failing which, jurisdiction will lie with the courts of * [CHSN, M.S] *.

---

* Accepted and Agreed:*
    `;

interface ParsingData {
    mandate?: Partial<Mandate>;
    property?: any;
    ownerName?: string;
    partnerName?: string;
}

export const parseMandateTemplate = (data: ParsingData): string => {
    let text = TEMPLATE_TEXT;
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 90);

    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    const todayStr = dateFormatter.format(now);
    const endDateStr = dateFormatter.format(endDate);

    // Helper for currency
    const formatMoney = (amount: number | string) => {
        if (!amount) return "N/A";
        return Number(amount).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });
    };

    // 1. Data Mapping
    // 1. Data Mapping
    const ownerName = data.ownerName || data.mandate?.seller_name || "Property Owner";

    // Partner Name Logic
    let partnerName = "Exclusive Marketing and Sales Partner";
    if (data.mandate?.deal_type === DealType.WITH_PLATFORM) {
        partnerName = "SaudaPakka (A Brand of SaudaPakka)";
    } else if (data.mandate?.deal_type === DealType.WITH_BROKER && data.mandate?.broker_name) {
        partnerName = data.mandate.broker_name;
    } else if (data.partnerName) {
        partnerName = data.partnerName;
    }

    const designation = data.mandate?.deal_type === DealType.WITH_PLATFORM
        ? "Official Exclusive Platform Marketing Partner"
        : "Exclusive Marketing and Sales Partner";

    const projectName = data.property?.title || "[Project Name]";

    // Address Logic
    const addressParts = [
        data.property?.address_line_1,
        data.property?.city,
        data.property?.state,
        data.property?.zip_code
    ].filter(Boolean);
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : "[Full Address]";
    const cityStatePin = [
        data.property?.city,
        data.property?.state,
        data.property?.zip_code
    ].filter(Boolean).join(', ') || "[City, State, PIN]";

    const flatType = data.property?.type || "Residential";
    const area = data.property?.carpet_area ? `${data.property.carpet_area} Sq.Ft` : "As per records";
    const floor = data.property?.floor_number ? `Floor ${data.property.floor_number} ` : "As per records";

    const price = data.property?.price ? formatMoney(data.property.price) : "[Amount]";
    const commission = data.mandate?.commission_rate ? `${data.mandate.commission_rate}% ` : "2%";
    const exclusivity = data.mandate?.is_exclusive ? "Exclusive" : "Exclusive"; // Defaulting to Exclusive as per template implication for partner

    // 2. Replacements
    const replacements: Record<string, string> = {
        "\\[Insert Date\\]": todayStr,
        "\\[Start Date\\]": todayStr,
        "\\[End Date\\]": endDateStr,
        "\\[Developer / Owner Name\\]": ownerName,
        "\\[Marketing Partner Name –\\]": partnerName,
        "\\[Marketing Partner Name – \\]": partnerName, // Backup for typo
        "\\[Sir / Madam / Mr\\.XYZ\\]": partnerName,
        "\\[Project Name –\\]": projectName,
        "\\[Project Name – \\]": projectName,
        "\\[Address of Project\\]": data.property?.address_line_1 || "[Address Line 1]",
        "\\[City, State, PIN\\]": cityStatePin,
        "\\[Full Address\\]": fullAddress,
        "\\[Flat Type\\]": flatType,
        "\\[Area\\]": area,
        "\\[Floor\\]": floor,
        "\\[2%\\]": commission,
        "\\[Amount\\]": price,
        "\\[Exclusive / Non-Exclusive\\]": exclusivity,
        "Exclusive / Non - Exclusive Marketing Partner": designation, // Dynamic designation
        "\\[India\\]": "India",
        "\\[CHSN ,M.S\\]": "Mumbai, Maharashtra" // Defaulting to Mumbai based on CHSN/MS implication or project default
    };

    Object.entries(replacements).forEach(([key, value]) => {
        text = text.replace(new RegExp(key, 'g'), value);
    });

    return text;
};
