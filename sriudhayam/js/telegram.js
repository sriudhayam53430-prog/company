async function sendTelegramMessage(message) {
    const botToken = "8181871966:AAGVCJtCn4CbMjW_NQPtMN88z7W3nK1Pd4U";
    const chatId = "2118454729";

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message
        })
    });

    const data = await response.json();
    console.log("Telegram response:", data);
    return data;
}

function buildSeekerMessage(values) {
    return `New Candidate Registered\n\nName: ${values.name}\nPhone: ${values.phone}\nJob: ${values.job}\nLocation: ${values.location}\n\nCompany: ${values.company || "ABC Textiles"}\nSalary: ${values.salary || "₹18,000"}`;
}

function buildEmployerMessage(values) {
    return `New Employer Requirement\n\nCompany: ${values.company}\nRequired Job: ${values.requiredJob}\nLocation: ${values.location}\nSalary: ${values.salary || "₹18,000"}`;
}

function buildMatchingMessage(seeker, employer) {
    return `New Matching Candidate\n\nName: ${seeker.name}\nPhone: ${seeker.phone}\nJob: ${seeker.job}\nLocation: ${seeker.location}\n\nCompany: ${employer.company}\nSalary: ${employer.salary || "₹18,000"}`;
}

const jobSeekers = [];
const employers = [];

function findMatches() {
    return jobSeekers.flatMap((seeker) => {
        return employers
            .filter((employer) =>
                seeker.job.toLowerCase() === employer.requiredJob.toLowerCase() &&
                seeker.location.toLowerCase() === employer.location.toLowerCase()
            )
            .map((employer) => ({ seeker, employer }));
    });
}

async function handleSeekerSubmit(values) {
    jobSeekers.push(values);

    const initialMessage = buildSeekerMessage(values);
    await sendTelegramMessage(initialMessage);

    const matches = findMatches();
    for (const match of matches) {
        const matchMessage = buildMatchingMessage(match.seeker, match.employer);
        await sendTelegramMessage(matchMessage);
    }
}

async function handleEmployerSubmit(values) {
    employers.push(values);

    const initialMessage = buildEmployerMessage(values);
    await sendTelegramMessage(initialMessage);

    const matches = findMatches();
    for (const match of matches) {
        const matchMessage = buildMatchingMessage(match.seeker, match.employer);
        await sendTelegramMessage(matchMessage);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const seekerForm = document.getElementById("jobApplicationForm");
    const employerForm = document.getElementById("employerForm");

    if (seekerForm) {
        seekerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(seekerForm);
            const values = {
                name: formData.get("name")?.toString().trim() || "",
                phone: formData.get("phone")?.toString().trim() || "",
                job: formData.get("job")?.toString().trim() || "",
                location: formData.get("location")?.toString().trim() || "",
                company: formData.get("company")?.toString().trim() || "",
                salary: formData.get("salary")?.toString().trim() || ""
            };

            try {
                await handleSeekerSubmit(values);
                alert("Seeker registration sent successfully.");
                seekerForm.reset();
            } catch (error) {
                console.error(error);
                alert("There was an error sending the seeker registration. Please try again.");
            }
        });
    }

    if (employerForm) {
        employerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(employerForm);
            const values = {
                company: formData.get("company")?.toString().trim() || "",
                requiredJob: formData.get("requiredJob")?.toString().trim() || "",
                location: formData.get("location")?.toString().trim() || "",
                salary: formData.get("salary")?.toString().trim() || ""
            };

            try {
                await handleEmployerSubmit(values);
                alert("Employer request sent successfully.");
                employerForm.reset();
            } catch (error) {
                console.error(error);
                alert("There was an error sending the employer request. Please try again.");
            }
        });
    }
});
