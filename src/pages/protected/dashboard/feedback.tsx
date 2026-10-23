import { useState, type FormEvent } from "react";
import { useOutletContext } from "react-router";
import { useAuth } from "../../../auth/authProvider";
import { toast } from "../../../components/ui/toast";
import supabase from "../../../lib/supabase";
import { CheckCircle2, LoaderCircle, MessageSquareText } from "lucide-react";

type DashboardContext = { bid: string };
type FeedbackAnswers = {
  feedback_type: string;
  overall_rating: string;
  ease_rating: string;
  reliability_rating: string;
  recommend_score: string;
  main_goal: string;
  features_used: string[];
  task_status: string;
  issue_frequency: string;
  what_worked_well: string;
  biggest_difficulty: string;
  confusing_or_unexpected: string;
  requested_improvements: string;
  missing_features: string;
  additional_comments: string;
  allow_follow_up: boolean;
};

const initialAnswers: FeedbackAnswers = {
  feedback_type: "", overall_rating: "", ease_rating: "", reliability_rating: "", recommend_score: "", main_goal: "", features_used: [], task_status: "", issue_frequency: "", what_worked_well: "", biggest_difficulty: "", confusing_or_unexpected: "", requested_improvements: "", missing_features: "", additional_comments: "", allow_follow_up: false,
};

const questionTitle = "mb-2 block text-sm font-semibold";
const inputClass = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15";
const choices = {
  feedback_type: ["General feedback", "Bug or something broken", "Feature request", "Data or report concern", "Something else"],
  main_goal: ["Record sales or income", "Record purchases or expenses", "Track customers or suppliers", "Track products and stock", "Understand business performance", "Prepare information for an accountant", "Other"],
  features_used: ["Overview", "New entry / Transactions", "General Ledger", "Accounts", "Contacts", "Inventory", "Financial Statements", "Business Settings"],
  task_status: ["Yes, easily", "Yes, with some difficulty", "Partly", "No", "I was exploring"],
  issue_frequency: ["This is my first issue", "Occasionally", "Often", "Every time I try"],
};

export default function FeedbackPage() {
  const { bid } = useOutletContext<DashboardContext>();
  const { user } = useAuth();
  const [answers, setAnswers] = useState(initialAnswers);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const setField = <K extends keyof FeedbackAnswers>(key: K, value: FeedbackAnswers[K]) => setAnswers((current) => ({ ...current, [key]: value }));
  const toggleFeature = (feature: string) => setField("features_used", answers.features_used.includes(feature) ? answers.features_used.filter((item) => item !== feature) : [...answers.features_used, feature]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bid || !user) {
      toast.add({ description: "Your session expired. Sign in again to send feedback.", type: "error" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("feedbacks").insert({ user_id: user.id, business_id: bid, answers });
    setSubmitting(false);
    if (error) {
      toast.add({ description: `Could not submit feedback: ${error.message}`, type: "error" });
      return;
    }
    setAnswers(initialAnswers);
    setSubmitted(true);
    toast.add({ description: "Thanks. Your feedback has been sent.", type: "success" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="rounded-3xl border border-primary/15 bg-primary/5 p-6 sm:p-8">
        <div className="mb-3 flex items-center gap-2 text-primary"><MessageSquareText className="size-5"/><span className="text-xs font-bold uppercase tracking-wider">Help us improve Ihsaab</span></div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Tell us about your experience</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Your answers go to the Ihsaab team and help shape this beta. Share as much detail as you can. Feedback is connected to your account and business so we can understand the context.</p>
      </header>

      {submitted && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="size-4"/>Your feedback was submitted. You can send another response any time.</div>}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-8">
        <fieldset>
          <legend className={questionTitle}>What kind of feedback are you sharing? <span className="text-destructive">*</span></legend>
          <div className="grid gap-2 sm:grid-cols-2">{choices.feedback_type.map((choice) => <label key={choice} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm hover:bg-muted/50"><input required type="radio" name="feedback_type" value={choice} checked={answers.feedback_type === choice} onChange={() => setField("feedback_type", choice)} className="accent-primary"/>{choice}</label>)}</div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <fieldset><legend className={questionTitle}>Overall, how satisfied are you? <span className="text-destructive">*</span></legend><Rating options={["Very dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very satisfied"]} name="overall" value={answers.overall_rating} onChange={(value) => setField("overall_rating", value)} /></fieldset>
          <fieldset><legend className={questionTitle}>How easy was it to use? <span className="text-destructive">*</span></legend><Rating options={["Very difficult", "Difficult", "Neither", "Easy", "Very easy"]} name="ease" value={answers.ease_rating} onChange={(value) => setField("ease_rating", value)} /></fieldset>
        </div>
        <fieldset><legend className={questionTitle}>How reliable did the app feel? <span className="text-destructive">*</span></legend><Rating options={["Not reliable", "A little reliable", "Somewhat reliable", "Reliable", "Very reliable"]} name="reliability" value={answers.reliability_rating} onChange={(value) => setField("reliability_rating", value)} /></fieldset>

        <fieldset><legend className={questionTitle}>How likely are you to recommend Ihsaab to another business owner? <span className="text-destructive">*</span></legend><div className="grid grid-cols-6 gap-2 sm:grid-cols-11">{Array.from({ length: 11 }, (_, index) => String(index)).map((score) => <label key={score} className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-2 text-xs ${answers.recommend_score === score ? "border-primary bg-primary/10 text-primary" : "border-border"}`}><input required type="radio" name="recommend_score" value={score} checked={answers.recommend_score === score} onChange={() => setField("recommend_score", score)} className="accent-primary"/>{score}</label>)}</div><div className="mt-1 flex justify-between text-[11px] text-muted-foreground"><span>Not at all likely</span><span>Extremely likely</span></div></fieldset>

        <fieldset><legend className={questionTitle}>What were you mainly trying to do? <span className="text-destructive">*</span></legend><div className="grid gap-2 sm:grid-cols-2">{choices.main_goal.map((choice) => <label key={choice} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm hover:bg-muted/50"><input required type="radio" name="main_goal" value={choice} checked={answers.main_goal === choice} onChange={() => setField("main_goal", choice)} className="accent-primary"/>{choice}</label>)}</div></fieldset>

        <fieldset><legend className={questionTitle}>Which parts have you tried? <span className="font-normal text-muted-foreground">(Select all that apply)</span></legend><div className="grid gap-2 sm:grid-cols-2">{choices.features_used.map((choice) => <label key={choice} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm hover:bg-muted/50"><input type="checkbox" checked={answers.features_used.includes(choice)} onChange={() => toggleFeature(choice)} className="size-4 accent-primary"/>{choice}</label>)}</div></fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <fieldset><legend className={questionTitle}>Were you able to complete your task? <span className="text-destructive">*</span></legend><ChoiceRadios name="task_status" values={choices.task_status} value={answers.task_status} onChange={(value) => setField("task_status", value)} /></fieldset>
          <fieldset><legend className={questionTitle}>How often did you encounter a problem? <span className="text-destructive">*</span></legend><ChoiceRadios name="issue_frequency" values={choices.issue_frequency} value={answers.issue_frequency} onChange={(value) => setField("issue_frequency", value)} /></fieldset>
        </div>

        <TextQuestion label="What worked well for you?" required value={answers.what_worked_well} onChange={(value) => setField("what_worked_well", value)} placeholder="Which part felt useful or saved you effort?" />
        <TextQuestion label="What was the biggest difficulty?" required value={answers.biggest_difficulty} onChange={(value) => setField("biggest_difficulty", value)} placeholder="Tell us what you were doing and where you got stuck." />
        <TextQuestion label="Was anything confusing or unexpected?" value={answers.confusing_or_unexpected} onChange={(value) => setField("confusing_or_unexpected", value)} placeholder="Describe what you expected and what happened instead." />
        <TextQuestion label="What would you improve first?" required value={answers.requested_improvements} onChange={(value) => setField("requested_improvements", value)} placeholder="A specific change helps us act on your feedback." />
        <TextQuestion label="What feature or workflow is missing for your business?" value={answers.missing_features} onChange={(value) => setField("missing_features", value)} placeholder="Tell us what you need to manage your business without spreadsheets." />
        <TextQuestion label="Anything else you want the team to know?" value={answers.additional_comments} onChange={(value) => setField("additional_comments", value)} placeholder="Optional" />

        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-muted/50 p-3 text-sm"><input type="checkbox" checked={answers.allow_follow_up} onChange={(event) => setField("allow_follow_up", event.target.checked)} className="mt-0.5 size-4 accent-primary"/><span>It’s okay for the Ihsaab team to contact me about this feedback using my account details.</span></label>
        <div className="flex flex-col justify-between gap-3 border-t border-border pt-5 sm:flex-row sm:items-center"><p className="text-xs text-muted-foreground"><span className="text-destructive">*</span> Required questions. Please don’t include passwords or sensitive financial details.</p><button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">{submitting && <LoaderCircle className="size-4 animate-spin"/>}{submitting ? "Sending feedback…" : "Submit feedback"}</button></div>
      </form>
    </div>
  );
}

function Rating({ options, name, value, onChange }: { options: string[]; name: string; value: string; onChange: (value: string) => void }) {
  return <div className="space-y-1.5">{options.map((option, index) => <label key={option} className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"><input required type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} className="accent-primary"/><span>{index + 1} · {option}</span></label>)}</div>;
}

function ChoiceRadios({ name, values, value, onChange }: { name: string; values: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="space-y-1.5">{values.map((option) => <label key={option} className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground"><input required type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} className="accent-primary"/>{option}</label>)}</div>;
}

function TextQuestion({ label, required = false, value, onChange, placeholder }: { label: string; required?: boolean; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block"><span className={questionTitle}>{label}{required && <> <span className="text-destructive">*</span></>}</span><textarea required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={3} maxLength={4000} className={`${inputClass} min-h-24 resize-y`}/><span className="mt-1 block text-right text-[10px] text-muted-foreground">{value.length}/4000</span></label>;
}
