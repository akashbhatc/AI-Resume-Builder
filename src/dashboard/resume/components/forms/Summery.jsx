import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import GlobalApi from './../../../../../service/GlobalApi';
import { Brain, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AIChatSession } from './../../../../../service/AIModal';

const prompt = "Job Title: {jobTitle} , Depends on job title give me list of summery for 3 experience levels, Mid Level and Fresher level in 3-4 lines in an array called experience_levels, With summary and experience_level Field in JSON Format"

function Summery({ enabledNext }) {
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const [summery, setSummery] = useState('');
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const [aiGeneratedSummeryList, setAiGenerateSummeryList] = useState([]);

    useEffect(() => {
        if (resumeInfo?.summery) {
            setSummery(resumeInfo.summery);
        }
    }, [resumeInfo?.summery]);

    useEffect(() => {
        if (summery) {
            setResumeInfo({
                ...resumeInfo,
                summery: summery
            })
        }
    }, [summery]);

    const GenerateSummeryFromAI = async () => {
        setLoading(true)
        const PROMPT = prompt.replace('{jobTitle}', resumeInfo?.jobTitle);
        console.log(PROMPT);

        try {
            const result = await AIChatSession.sendMessage(PROMPT);
            const responseText = result.response.text();
            const parsedResponse = JSON.parse(responseText);
            console.log(parsedResponse);

            // Check if 'experience_levels' exists and is an array
            if (parsedResponse && Array.isArray(parsedResponse.experience_levels)) {
                setAiGenerateSummeryList(parsedResponse.experience_levels);  // Use the experience_levels array
            } else {
                toast.error("AI response is not valid. Please try again.");
                setAiGenerateSummeryList([]);
            }
        } catch (error) {
            console.error("Error parsing AI response:", error);
            toast.error("Failed to generate summaries from AI.");
            setAiGenerateSummeryList([]);
        }
        setLoading(false);
    }

    const onSave = (e) => {
        e.preventDefault();

        setLoading(true)
        const data = {
            data: {
                summery: summery
            }
        }

        GlobalApi.UpdateResumeDetail(params?.resumeId, data).then(resp => {
            console.log(resp);
            enabledNext(true);
            setLoading(false);
            toast("Details updated")
        }, (error) => {
            setLoading(false);
            toast.error("Error updating details");
        })
    }

    return (
        <div>
            <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10'>
                <h2 className='font-bold text-lg'>Summery</h2>
                <p>Add Summery for your job title</p>

                <form className='mt-7' onSubmit={onSave}>
                    <div className='flex justify-between items-end'>
                        <label>Add Summery</label>
                        <Button variant="outline" onClick={() => GenerateSummeryFromAI()}
                            type="button" size="sm" className="border-primary text-primary flex gap-2">
                            <Brain className='h-4 w-4' />  Generate from AI
                        </Button>
                    </div>
                    <Textarea className="mt-5" required
                        value={summery}
                        defaultValue={summery ? summery : resumeInfo?.summery}
                        onChange={(e) => setSummery(e.target.value)}
                    />
                    <div className='mt-2 flex justify-end'>
                        <Button type="submit" disabled={loading}>
                            {loading ? <LoaderCircle className='animate-spin' /> : 'Save'}
                        </Button>
                    </div>
                </form>
            </div>

            {Array.isArray(aiGeneratedSummeryList) && aiGeneratedSummeryList.length > 0 && (
                <div className='my-5'>
                    <h2 className='font-bold text-lg'>Suggestions</h2>
                    {aiGeneratedSummeryList.map((item, index) => (
                        <div key={index}
                            onClick={() => setSummery(item?.summary)}  // Accessing the summary text
                            className='p-5 shadow-lg my-4 rounded-lg cursor-pointer'>
                            <h2 className='font-bold my-1 text-primary'>Level: {item?.experience_level}</h2>
                            <p>{item?.summary}</p>  {/* Display the summary */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Summery;
