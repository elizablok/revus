import { ReactNode, useState } from 'react';
import { Form } from 'react-final-form';
import FileUploadField from '../../../shared/FileUploadField';
import styles from './index.module.css';
import copyIcon from '../../../../../public/copy.png';
import checkIcon from '../../../../../public/check.svg';

function ReviewCode() {
  const [review, setReview] = useState('');
  const [uploadBoxText, setUploadBoxText] = useState('No file chosen');
  const [copied, setCopied] = useState(false);

  const dispatch = (res: string) => res;
  const reviewCodeThunk = (values: { code: { name: string; value: string }[] }) => {
    const { code } = values as { code: { name: string; value: string }[] };
    if (code.length > 1) {
      return 'Все отлично! Продолжай в том же духе.';
    }
    return 'Давай по новой, Миша, все хуйня!';
  };

  const onSubmit = async (values: { code: File[] | null }) => {
    if (!values.code) {
      throw new Error('Choose a file to review');
    }

    const fileReadPromises = values.code.map((file) => {
      return new Promise<{ name: string; value: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const codeString: string | ArrayBuffer | null = reader.result;
          if (typeof codeString === 'string') {
            resolve({ name: file.name, value: codeString });
          } else {
            reject(new Error(`Failed to read the file '${file.name}' as text`));
          }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
      });
    });

    const code = await Promise.all(fileReadPromises);
    let result: string = '';
    try {
      result = reviewCodeThunk({ code }) ?? '';
      dispatch(result);
    } catch {
      return;
    }
    setReview(result);
    setUploadBoxText('No file chosen');
  };

  const copyReview = () => {
    if (copied) {
      setCopied(false);
      return;
    }
    navigator.clipboard.writeText(review);
    setCopied(true);
  };

  const formComponentProps = {
    type: 'file',
    name: 'code',
    label: 'Upload code',
    accept: '.js,.ts,.py,.c,.java,.php,.swift,.cc,.cpp,.cxx,.cs,.rs,.go,.kt,.rb,.ex',
    multiple: true,
    uploadBoxTextState: { uploadBoxText, setUploadBoxText },
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ code: null }}
      render={({ handleSubmit, submitError }: { handleSubmit: () => void; submitError?: ReactNode }) => (
        <div className={styles.formContainer}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <FileUploadField
              submitButton={
                <button className={styles.submitButton} type="submit">
                  Review
                </button>
              }
              {...formComponentProps}
            />
            {submitError && <span className={styles.error}>{submitError}</span>}
          </form>
          {review != '' && (
            <div className={styles.reviewContainer}>
              <button className={styles.copyButton} onClick={copyReview}>
                {copied ? (
                  <>
                    <img src={checkIcon} width="15" height="15" alt="copyIcon" />
                    <div>Copied</div>
                  </>
                ) : (
                  <>
                    <img src={copyIcon} width="15" height="15" alt="copyIcon" />
                    <div>Copy</div>
                  </>
                )}
              </button>
              <div className={styles.review}>{review}</div>
            </div>
          )}
        </div>
      )}
    />
  );
}

export default ReviewCode;
