const form = document.getElementById("contactForm");
const successMessage = document.getElementById("successMessage");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };
  try {
    const response = await fetch(
      "https://soft-fudge-2c6514.netlify.app/api/v1/contactUs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    if (response.ok && successMessage) {
      // form.reset();
      successMessage.style.display = "block";
      setTimeout(() => {
        successMessage.style.display = "none";
      }, 5000);
    } else {
      alert("There was an error sending your message. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("There was a network error. Please check your connection.");
  }
});

const validateField = (field, errorElement) => {
  if (!field.value.trim()) {
    errorElement.textContent = "This field is required";
    errorElement.style.display = "block";
    return false;
  }
  errorElement.style.display = "none";
  return true;
};

document.querySelectorAll("input, textarea").forEach((element) => {
  element.addEventListener("input", () => {
    const errorElement = document.getElementById(`${element.id}Error`);
    validateField(element, errorElement);
  });
});
