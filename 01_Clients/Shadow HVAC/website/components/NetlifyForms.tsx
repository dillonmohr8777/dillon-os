export function NetlifyForms() {
  return (
    <div aria-hidden="true" hidden>
      <form name="contact" method="POST" data-netlify="true" data-netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="contact" />
        <input name="bot-field" />
        <input name="name" />
        <input name="phone" />
        <input name="email" type="email" />
        <textarea name="message" />
      </form>

      <form
        name="service-request"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
      >
        <input type="hidden" name="form-name" value="service-request" />
        <input name="bot-field" />
        <input name="service" />
        <input name="urgency" />
        <input name="date" />
        <input name="address" />
        <input name="name" />
        <input name="phone" />
        <input name="email" type="email" />
        <textarea name="message" />
      </form>
    </div>
  );
}
