"use client";

import { FocusEventHandler, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { useEditor } from '@/lib/editor/editor-provider';
import { toast } from 'sonner';

type FormData = {
    description: string;
};

const DescriptionForm = () => {
    const { state, dispatch } = useEditor();
    const { control, setValue } = useForm<FormData>();
    const [formattedDescription, setFormattedDescription] = useState('');

    const handleDescriptionChange = (value: string) => {
        const formatted = value
            .replace(/(^|\s)(#[a-z\d-]+)/ig, '$1<span style="color: rgb(59 130 246);">$2</span>')
            .replace(/(https?:\/\/[^\s]+)/ig, '<a href="$1" target="_blank" style="color: rgb(59 130 246);">$1</a>')
            .replace(/\n/g, '<br>');

        const styledFormatted = `<span style="color: rgb(100 116 139);">${formatted}</span>`;
        setFormattedDescription(styledFormatted);
    };

    const handleOnBlurDescriptionChange: FocusEventHandler<HTMLTextAreaElement> = (
        event
    ) => {
        const value = event.target.value;

        if (value !== state.editor.description) {
            dispatch({
                type: 'UPDATE_DESCRIPTION',
                payload: { description: formattedDescription },
            });
            toast.success('Description updated successfully.');

            console.log("description: " + JSON.stringify(state.editor.description));
        }
    };

    return (
        <form className="p-2 rounded shadow w-full">
            <div className="mb-4">
                <Controller
                    name="description"
                    control={control}
                    defaultValue={state.editor.description || ''}
                    render={({ field }) => (
                        <Textarea
                            id="description"
                            {...field}
                            onChange={(e) => {
                                field.onChange(e);
                                handleDescriptionChange(e.target.value);
                            }}
                            onBlur={handleOnBlurDescriptionChange}
                            placeholder="Enter your description..."
                            className="mt-1 block w-full account-form_input rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            rows={5}
                            maxLength={2000}
                        />
                    )}
                />
            </div>
        </form>
    );
};

export default DescriptionForm;
