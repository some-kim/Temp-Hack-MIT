// src/auth/SignUp.jsx
import { useEffect, useState } from "react";
import {
  Card,
  Steps,
  Button,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Typography,
  Alert,
} from "antd";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

const { Title, Paragraph } = Typography;

export default function SignUp() {
  const nav = useNavigate();

  // auth uuid from Supabase
  const [uid, setUid] = useState(null);

  // numeric Users.id (int8) used by Income/Savings/Spending.user_id
  const [userRowId, setUserRowId] = useState(null);

  // UI state
  const [current, setCurrent] = useState(0);
  const [emailCached, setEmailCached] = useState("");

  // fetch logged-in user (if any)
  useEffect(() => {
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) console.warn("getUser error:", error.message);
      if (user?.id) setUid(user.id);
    })();
  }, []);

  const stepsMeta = [
    { title: "Account" },
    { title: "Personal" },
    { title: "Income" },
    { title: "Savings" },
    { title: "Spending" },
  ];

  const next = () =>
    setCurrent((c) => Math.min(c + 1, stepsMeta.length - 1));
  const prev = () =>
    setCurrent((c) => Math.max(c - 1, 0));

  const steps = [
    {
      key: "account",
      content: (
        <AccountStep
          onDone={(newUid, email) => {
            if (newUid) setUid(newUid);
            if (email) setEmailCached(email);
            console.log("AccountStep → next()");
            next();
          }}
        />
      ),
      showNav: false,
    },
    {
      key: "personal",
      content: (
        <PersonalStep
          uid={uid}
          emailFallback={emailCached}
          setUserRowId={setUserRowId}
          onDone={() => {
            console.log("PersonalStep → next()");
            next();
          }}
        />
      ),
      showNav: true,
    },
    {
      key: "income",
      content: (
        <IncomeStep
          userRowId={userRowId}
          onDone={() => {
            console.log("IncomeStep → next()");
            next();
          }}
        />
      ),
      showNav: true,
    },
    {
      key: "savings",
      content: (
        <SavingsStep
          userRowId={userRowId}
          onDone={() => {
            console.log("SavingsStep → next()");
            next();
          }}
        />
      ),
      showNav: true,
    },
    {
      key: "spending",
      content: (
        <SpendingStep
          userRowId={userRowId}
          onFinish={() => {
            console.log("SpendingStep → nav(/app/individual/first-time)");
            nav("/app/individual/first-time", { replace: true });
          }}
        />
      ),
      showNav: true,
    },
  ];

  return (
    <Card style={{ maxWidth: 880, margin: "48px auto", borderRadius: 12 }}>
      <Title level={3} style={{ marginBottom: 8 }}>
        Create your account
      </Title>
      <Paragraph style={{ marginTop: -8, color: "#666" }}>
        Fill each page. The dots show your progress. Data saves on each “Next”.
      </Paragraph>

      <Steps
        current={current}
        items={stepsMeta.map((s) => ({ title: s.title }))}
        style={{ margin: "16px 0 24px" }}
      />

      <div style={{ minHeight: 340 }}>{steps[current].content}</div>

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

/* ------------------ STEP 0: Account / Auth ------------------ */
function AccountStep({ onDone }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const submit = async ({ email, password }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/signup` },
      });

      if (error?.message?.toLowerCase().includes("already registered")) {
        const { data: d2, error: e2 } =
          await supabase.auth.signInWithPassword({ email, password });
        if (e2) {
          message.warning("Account exists but login failed; continuing.");
          return onDone(null, email);
        }
        message.success("Logged in.");
        return onDone(d2.user.id, email);
      }

      if (error) {
        message.warning(error.message + " • Continuing to Personal.");
        return onDone(null, email);
      }

      // If email confirm ON, user may be null → try reading again
      let id = data.user?.id;
      if (!id) {
        const { data: gu } = await supabase.auth.getUser();
        id = gu?.user?.id ?? null;
      }

      if (!id) {
        message.info("Please confirm your email. You can keep going now.");
        return onDone(null, email);
      }

      message.success("Account created.");
      onDone(id, email);
    } catch (e) {
      console.error("AccountStep error:", e);
      message.error("Unexpected error. Continuing.");
      onDone(null, form.getFieldValue("email"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={submit} style={{ maxWidth: 420 }}>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
        <Input placeholder="you@example.com" />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
        <Input.Password placeholder="••••••••" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={loading}>
        Next
      </Button>
    </Form>
  );
}

/* ------------------ STEP 1: Users (bridge with auth_uid) ------------------ */
function PersonalStep({ uid, emailFallback, setUserRowId, onDone }) {
  const [form] = Form.useForm();

  const submit = async (v) => {
    try {
      if (!uid) {
        message.warning("Not signed in yet — skipping DB write for now.");
        setUserRowId(null);
        return;
      }

      const { error: upErr } = await supabase
        .from("Users")
        .upsert(
          {
            auth_uid: uid, // BRIDGE
            name: v.name,
            age: v.age ?? null,
            email: v.email || emailFallback,
            occupation: v.occupation ?? null,
            financial_goals: v.financial_goals ?? null,
          },
          { onConflict: "auth_uid" } // requires a unique index on auth_uid
        );

      if (upErr) {
        message.error(upErr.message);
        setUserRowId(null);
        return;
      }

      const { data: row, error: selErr } = await supabase
        .from("Users")
        .select("id")
        .eq("auth_uid", uid)
        .maybeSingle();

      if (selErr || !row) {
        message.warning("Saved profile, but couldn't fetch account id yet.");
        setUserRowId(null);
        return;
      }

      setUserRowId(row.id);
      message.success("Saved personal info");
    } catch (e) {
      console.error("PersonalStep error:", e);
      message.error("Unexpected error; continuing.");
      setUserRowId(null);
    } finally {
      onDone(); // ALWAYS advance
    }
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

      <Form layout="vertical" form={form} onFinish={submit} style={{ maxWidth: 420 }}>
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

/* ------------------ STEP 2: Income ------------------ */
function IncomeStep({ userRowId, onDone }) {
  const [form] = Form.useForm();
  const submit = async (v) => {
    try {
      if (!userRowId) {
        message.warning("Missing account id — skipping save.");
        return;
      }
      const { error } = await supabase.from("Income").insert({
        user_id: userRowId,
        annual_income: Number(v.annual_income || 0),
      });
      if (error) message.error(error.message);
      else message.success("Saved income");
    } catch (e) {
      console.error("IncomeStep error:", e);
      message.error("Unexpected error; continuing.");
    } finally {
      onDone(); // ALWAYS advance
    }
  };
  return (
    <Form layout="vertical" form={form} onFinish={submit} style={{ maxWidth: 420 }}>
      <Form.Item
        name="annual_income"
        label="Annual income"
        rules={[{ required: true }]}
      >
        <InputNumber prefix="$" style={{ width: "100%" }} />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Next
      </Button>
    </Form>
  );
}

/* ------------------ STEP 3: Savings ------------------ */
function SavingsStep({ userRowId, onDone }) {
  const [form] = Form.useForm();
  const submit = async (v) => {
    try {
      if (!userRowId) {
        message.warning("Missing account id — skipping save.");
        return;
      }
      const { error } = await supabase.from("Savings").insert({
        user_id: userRowId,
        saving_investment_account: !!v.saving_investment_account,
        current_amount: Number(v.current_amount || 0),
        interest_rate: Number(v.interest_rate || 0) / 100,
        checking_account: Number(v.checking_account || 0),
      });
      if (error) message.error(error.message);
      else message.success("Saved savings");
    } catch (e) {
      console.error("SavingsStep error:", e);
      message.error("Unexpected error; continuing.");
    } finally {
      onDone(); // ALWAYS advance
    }
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
      <Button type="primary" htmlType="submit">
        Next
      </Button>
    </Form>
  );
}

/* ------------------ STEP 4: Spending ------------------ */
function SpendingStep({ userRowId, onFinish }) {
  const [form] = Form.useForm();
  const submit = async (v) => {
    try {
      if (!userRowId) {
        message.warning("Missing account id — skipping save.");
      } else {
        const { error } = await supabase.from("Spending").insert({
          user_id: userRowId,
          rent_utilities: Number(v.rent_utilities || 0),
          groceries_food: Number(v.groceries_food || 0),
          debt_payment: Number(v.debt_payment || 0),
          debt_interest: Number(v.debt_interest || 0) / 100,
          debt_left: Number(v.debt_left || 0),
          others: Number(v.others || 0),
          debt: v.debt || null,
        });
        if (error) message.error(error.message);
        else message.success("Saved spending");
      }
    } catch (e) {
      console.error("SpendingStep error:", e);
      message.error("Unexpected error; continuing.");
    } finally {
      onFinish(); // ALWAYS advance to landing
    }
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
      <Button type="primary" htmlType="submit">
        Finish
      </Button>
    </Form>
  );
}
