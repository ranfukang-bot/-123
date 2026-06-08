import nodemailer from 'nodemailer'

interface SendVerificationEmailParams {
  email: string
  code: string
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 465)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || user
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : port === 465

  if (!host || !user || !pass || !from) {
    throw new Error('邮箱发信服务尚未配置，请补充 SMTP_HOST、SMTP_USER、SMTP_PASS、SMTP_FROM')
  }

  return { host, port, user, pass, from, secure }
}

export function assertEmailServiceConfigured() {
  getSmtpConfig()
}

export async function sendVerificationEmail({ email, code }: SendVerificationEmailParams) {
  const config = getSmtpConfig()
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })

  await transporter.sendMail({
    from: config.from,
    to: email,
    subject: `PromptReel 注册验证码：${code}`,
    text: [
      `你的 PromptReel 注册验证码是：${code}`,
      '',
      '验证码 10 分钟内有效，请在注册页面输入。',
      '如果不是你本人操作，可以忽略这封邮件。',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,'PingFang SC','Microsoft YaHei',sans-serif;line-height:1.7;color:#111827;">
        <h2 style="margin:0 0 16px;">PromptReel 注册验证码</h2>
        <p>你的验证码是：</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;margin:20px 0;color:#2454d6;">${code}</div>
        <p style="color:#4b5563;">验证码 10 分钟内有效，请在注册页面输入。</p>
        <p style="color:#9ca3af;font-size:13px;">如果不是你本人操作，可以忽略这封邮件。</p>
      </div>
    `,
  })
}
