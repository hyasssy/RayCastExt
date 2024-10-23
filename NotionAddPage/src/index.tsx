import { Form, ActionPanel, Action, showToast, closeMainWindow, popToRoot } from "@raycast/api";
import { createPageInNotion } from "./notionAPI";

type Values = {
  textfield: string;
  textarea: string;
  datepicker: Date;
  checkbox: boolean;
  dropdown: string;
  tokeneditor: string[];
};

export default function Command() {
  const handleSubmit = async (values: Values) => {
    closeMainWindow();

    const success = await createPageInNotion(values.textfield, values.textarea, values.datepicker);

    if (success) {
      showToast({ title: "Saved", message: "Page created successfully" });
      popToRoot();
    } else {
      showToast({ title: "Error", message: "Failed to create page" });
    }
  };

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text="Quick Notion" />
      <Form.TextField id="textfield" title="タイトル" placeholder="Enter text" defaultValue="" />
      <Form.TextArea id="textarea" title="メモ" placeholder="Enter memo" defaultValue="" />
      <Form.DatePicker id="datepicker" title="Select Date" />
    </Form>
  );
}
