export interface LoggedSetsConfirm {
  title: string;
  description: string;
  okText: string;
  destructive?: boolean;
  onOk: () => void;
  onCancel?: () => void;
}
