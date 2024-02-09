"use client";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void;
}

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnborading, setShouldShowOnborading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [content, setContent] = useState("");

  let speechRecognition: SpeechRecognition | null;

  function handleStartEditor() {
    setShouldShowOnborading(false);
  }

  function handleContentChanged(e: ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    if (e.target.value === "") {
      setShouldShowOnborading(true);
    }
  }

  function handleSaveNote(e: FormEvent) {
    e.preventDefault();
    onNoteCreated(content);
    setContent("");
    setShouldShowOnborading(true);
    toast.success("Nota criada com sucesso.");
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!isSpeechRecognitionAPIAvailable) {
      alert("Infelizmente seu navegador não suporta a API de gravação.");
      return;
    }

    setIsRecording(true);
    setShouldShowOnborading(false);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.lang = "pt-BR";
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (event) => {
      const transciption = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");

      setContent(transciption);
    };

    speechRecognition.onerror = (event) => {};

    speechRecognition.start();
  }
  function handleStopRecording() {
    setIsRecording(false);
    if (speechRecognition !== null) {
      speechRecognition.stop();
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="flex flex-col gap-3 text-left rounded-md bg-slate-700 p-5 space-y-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sm font-medium test-slate-200">
          Adicione nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto
          automaticamente.
        </p>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/60" />
        <Dialog.Content className="fixed overflow-hidden left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[640px] h-[60vh] w-full bg-slate-700 rounded-md flex flex-col outline-none">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>
          <form className="flex flex-col flex-1">
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="text-sm font-medium test-slate-300">
                Adicione nota
              </span>
              {shouldShowOnborading ? (
                <p className="text-sm leading-6 text-slate-400 group">
                  Comece{" "}
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="text-lime-400 hover:underline"
                  >
                    {" "}
                    gravando uma nota{" "}
                  </button>{" "}
                  em áudio ou se preferir{" "}
                  <button
                    type="button"
                    onClick={handleStartEditor}
                    className="text-lime-400 hover:underline"
                  >
                    {" "}
                    utilize apenas texto{" "}
                  </button>
                  .
                </p>
              ) : (
                <textarea
                  autoFocus
                  onChange={handleContentChanged}
                  value={content}
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none outline-none flex-1"
                ></textarea>
              )}
            </div>
            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
              >
                <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                <span>Gravando! (clique p/ interromper)</span>?
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveNote}
                className="w-full bg-lime-400 py-4 text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
              >
                <span>Salvar nota</span>?
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
