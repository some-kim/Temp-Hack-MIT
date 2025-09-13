import { useEffect, useState } from "react";
import {
  Card, Steps, Button, Form, Input, InputNumber, Switch, message, Typography, Alert
} from "antd";
import { supabase } from "./supabaseClient";

const { Title, Paragraph } = Typography;

export default function SignUp() {
  const [current, setCurrent] = useState(0);
  const [uid, setUid] = useState(null);
  const [emailCached, setEmailCached] = useState("");

  // if user is already logged in, reuse uid , not sure if working 
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) setUid(user.id);
    })();
  }, []);

  const next = () => setCurrent((c) => Math.min(c + 1, stepsMeta.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const stepsMeta = [
    { title: "Account"  },
    { title: "Personal" },
    { title: "Income"   },
    { title: "Savings"  },
    { title: "Spending" },
  ];

  const steps = [
    {
      key: "account",
      content: (
        <AccountStep
          onDone={(newUid, email) => {
            if (newUid) setUid(newUid);
            if (email) setEmailCached(email);
            next();
          }}
        />
      ),
      // Account step has its own "Next" submit; had to hide  global controls for it, still needs to check if it works 
      showNav: false,
    },
    {
      key: "personal",
      content: (
        <PersonalStep
          uid={uid}
          emailFallback={emailCached}
          onDone={next}
        />
      ),
      showNav: true,
    },
    {
      key: "income",
      content: <IncomeStep uid={uid} onDone={next} />,
      showNav: true,
    },
    {
      key: "savings",
      content: <SavingsStep uid={uid} onDone={next} />,
      showNav: true,
    },
    {
      key: "spending",
      content: (
        <SpendingStep
          uid={uid}
          onDone={() => {
            message.success("All set! 🎉");
            // TODO: nav("/app/individual") after you add that route.
          }}
        />
      ),
      showNav: true,
    },
  ];

  return (
    <Card style={{ maxWidth: 880, margin: "48px auto", borderRadius: 12 }}>
      <Title level={3} style={{ marginBottom: 8 }}>Create your account</Title>
      <Paragraph style={{ marginTop: -8, color: "#666" }}>
        Fill each page. The dots show your progress. Data saves on each “Next”.
      </Paragraph>

      <Steps
        current={current}
        items={stepsMeta.map((s) => ({ title: s.title }))}
        style={{ margin: "16px 0 24px" }}
      />

      <div style={{ minHeight: 340 }}>{steps[current].content}</div>

      {/* Global Previous/Next for steps 1..4 (each step still submits its own form) next didt work forn ages  */}
      {steps[current].showNav && (
        <div style={{ marginTop: 16 }}>
          {current > 0 && (
            <Button onClick={prev} style={{ marginRight: 8 }}>
              Previous
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

/* ------------------ STEP 0: Create account (Auth) ------------------ */
function AccountStep({ onDone }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const submit = async ({ email, password }) => {
    setLoading(true);

    // Try to sign up first
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/signup` },
    });

    // If already registered, try logging in
    if (error?.message?.toLowerCase().includes("already registered")) {
      const { data: d2, error: e2 } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (e2) {
        message.warning("Account exists but login failed; continuing without session.");
        return onDone(null, email); // go ahead  anyway
      }
      message.success("Logged in.");
      return onDone(d2.user.id, email); // go ahead  with uid
    }

    if (error) {
      message.warning(error.message + " • Continuing to Personal.");
      setLoading(false);
      return onDone(null, email); // advance anyway
    }

    // If email confirmation is ON, data.user could be null; try to read current user
    let id = data.user?.id;
    if (!id) {
      const { data: gu } = await supabase.auth.getUser();
      id = gu?.user?.id ?? null;
    }

    setLoading(false);

    if (!id) {
      message.info("Check your email to confirm. You can still fill the survey now.");
      return onDone(null, email); // advance without uid
    }

    message.success("Account created.");
    onDone(id, email); // advance with uid
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={submit}
      style={{ maxWidth: 420 }}
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: "email" }]}
      >
        <Input placeholder="you@example.com" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, min: 6 }]}
      >
        <Input.Password placeholder="••••••••" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loading}>
        Next
      </Button>
    </Form>
  );
}

/* ------------------ STEP 1: Users table ------------------ */
/* Users: id (uuid) or user_id (uuid), name, age, email, occupation, financial_goals */
function PersonalStep({ uid, emailFallback, onDone }) {
  const [form] = Form.useForm();

  const submit = async (v) => {
    if (!uid) {
      message.warning("Not signed in yet — skipping DB write for now.");
      return onDone();
    }
    const payload = {
      // If your schema uses "user_id" instead of "id", change the next line to: user_id: uid,
      id: uid,
      name: v.name,
      age: v.age ?? null,
      email: v.email || emailFallback,
      occupation: v.occupation ?? null,
      financial_goals: v.financial_goals ?? null,
    };
    const { error } = await supabase.from("Users").upsert(payload);
    if (error) return message.error(error.message);
    message.success("Saved personal info");
    onDone();
  };

  return (
    <>
      {!uid && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="You can continue without confirming email; data will save once signed in."
        />
      )}
      <Form
        layout="vertical"
        form={form}
        onFinish={submit}
        style={{ maxWidth: 420 }}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="age" label="Age">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          initialValue={emailFallback}
          rules={[{ type: "email" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="occupation" label="Occupation">
          <Input />
        </Form.Item>
        <Form.Item name="financial_goals" label="Financial goals">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Next
        </Button>
      </Form>
    </>
  );
}

/* ------------------ STEP 2: Income table ------------------ */
/* Income: id, user_id, annual_income */
function IncomeStep({ uid, onDone }) {
  const [form] = Form.useForm();
  const submit = async (v) => {
    if (!uid) {
      message.warning("Not signed in yet — skipping DB write for now.");
      return onDone();
    }
    const { error } = await supabase.from("Income").insert({
      user_id: uid,
      annual_income: Number(v.annual_income || 0),
    });
    if (error) return message.error(error.message);
    message.success("Saved income");
    onDone();
  };
  return (
    <Form layout="vertical" form={form} onFinish={submit} style={{ maxWidth: 420 }}>
      <Form.Item name="annual_income" label="Annual income" rules={[{ required: true }]}>
        <InputNumber prefix="$" style={{ width: "100%" }} />
      </Form.Item>
      <Button type="primary" htmlType="submit">Next</Button>
    </Form>
  );
}

/* ------------------ STEP 3: Savings table ------------------ */
/* Savings: id, user_id, saving_investment_account (bool), current_amount, interest_rate (decimal), checking_account */
function SavingsStep({ uid, onDone }) {
  const [form] = Form.useForm();
  const submit = async (v) => {
    if (!uid) {
      message.warning("Not signed in yet — skipping DB write for now.");
      return onDone();
    }
    const { error } = await supabase.from("Savings").insert({
      user_id: uid,
      saving_investment_account: !!v.saving_investment_account,
      current_amount: Number(v.current_amount || 0),
      interest_rate: Number(v.interest_rate || 0) / 100, // 5 -> 0.05
      checking_account: Number(v.checking_account || 0),
    });
    if (error) return message.error(error.message);
    message.success("Saved savings");
    onDone();
  };
  return (
    <Form layout="vertical" form={form} onFinish={submit} style={{ maxWidth: 420 }}>
      <Form.Item name="current_amount" label="Savings balance">
        <InputNumber prefix="$" style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="interest_rate" label="Interest rate (%)">
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="checking_account" label="Checking balance">
        <InputNumber prefix="$" style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="saving_investment_account"
        label="Has investment account?"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Button type="primary" htmlType="submit">Next</Button>
    </Form>
  );
}

/* ------------------ STEP 4: Spending table ------------------ */
/* Spending: id, user_id, rent_utilities, groceries_food, debt (json), debt_payment, debt_interest, debt_left, others */
function SpendingStep({ uid, onDone }) {
  const [form] = Form.useForm();
  const submit = async (v) => {
    if (!uid) {
      message.warning("Not signed in yet — skipping DB write for now.");
      return onDone();
    }
    const { error } = await supabase.from("Spending").insert({
      user_id: uid,
      rent_utilities: Number(v.rent_utilities || 0),
      groceries_food: Number(v.groceries_food || 0),
      debt_payment: Number(v.debt_payment || 0),
      debt_interest: Number(v.debt_interest || 0) / 100,
      debt_left: Number(v.debt_left || 0),
      others: Number(v.others || 0),
      debt: v.debt || null,
    });
    if (error) return message.error(error.message);
    message.success("Saved spending");
    onDone();
  };
  return (
    <Form layout="vertical" form={form} onFinish={submit} style={{ maxWidth: 420 }}>
      <Form.Item name="rent_utilities" label="Rent & utilities (monthly)">
        <InputNumber prefix="$" style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="groceries_food" label="Groceries & food (weekly)">
        <InputNumber prefix="$" style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="debt_payment" label="Debt payment (monthly)">
        <InputNumber prefix="$" style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="debt_interest" label="Debt interest rate (%)">
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="debt_left" label="Debt remaining ($)">
        <InputNumber prefix="$" style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="others" label="Other expenses (weekly)">
        <InputNumber prefix="$" style={{ width: "100%" }} />
      </Form.Item>
      <Button type="primary" htmlType="submit">Finish</Button>
    </Form>
  );
}
