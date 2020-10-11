const nodemailer = require('nodemailer');

function generateOrderEmail({ order, total }) {
  return `
    <div>
      <h2>Your Recent Order for ${total}</h2>
      <p>Please start wakling over, we will have your order ready in the next 20 mins</p>
      <ul>
        ${order
          .map(
            (item) => `
          <li>
            <img src="${item.thumbnail}" alt="${item.name}">
            ${item.size} ${item.name} - ${item.price}
          </li>
        `
          )
          .join('')}
      </ul>
      <p>Your total is £${total} due at pickup</p>
    </div>
  `;
}

function wait(ms = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

// create a transport for nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 587,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.handler = async (event, context) => {
  await wait(5000);
  const body = JSON.parse(event.body);
  if (body.mapleSyrup) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Boop beep bop zzzt bood bye ERROR 34234',
      }),
    };
  }
  // validate the data coming in
  const requiredFields = ['email', 'name', 'order'];

  for (const field of requiredFields) {
    console.log(`checking that ${field} is good`);
    if (!body[field]) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Oops! You are missing the ${field} field`,
        }),
      };
    }
  }

  // make sure there are items in order
  if (!body.order.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Why would you order nothing?',
      }),
    };
  }

  // send the email
  const info = await transporter.sendMail({
    from: "Slick's Slices <slick@example.com>",
    to: `${body.name} <${body.email}>, orders@example.com`,
    subject: 'New Order!',
    html: generateOrderEmail({ order: body.order, total: body.total }),
  });

  // send the success or error message
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
};
