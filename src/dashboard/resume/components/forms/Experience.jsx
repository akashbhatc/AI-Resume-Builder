import React, { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import { useParams } from 'react-router-dom';
import GlobalApi from './../../../../../service/GlobalApi';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';
import RichTextEditor from '../RichTextEditor'; // Your rich text editor component

function Experience() {
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
  const params = useParams();
  const [loading, setLoading] = useState(false);

  // Use the "experience" key from the context
  const [experienceList, setExperienceList] = useState(resumeInfo?.experience || []);

  // Sync state when context updates
  useEffect(() => {
    setExperienceList(resumeInfo?.experience || []);
  }, [resumeInfo]);

  // Handle input changes for standard fields
  const handleChange = (event, index) => {
    const { name, value } = event.target;
    const newEntries = [...experienceList];
    newEntries[index][name] = value;
    setExperienceList(newEntries);
    setResumeInfo({ ...resumeInfo, experience: newEntries });
  };

  // Updated: Handle rich text editor changes as a plain string value
  const handleRichTextEditorChange = (newValue, index) => {
    const newEntries = [...experienceList];
    newEntries[index].workSummery = newValue;
    setExperienceList(newEntries);
    setResumeInfo({ ...resumeInfo, experience: newEntries });
  };

  // Add a new experience entry
  const addNewExperience = () => {
    const newEntry = {
      title: '',
      companyName: '',
      city: '',
      state: '',
      startDate: '',
      endDate: '',
      workSummery: '',
    };
    const updatedList = [...experienceList, newEntry];
    setExperienceList(updatedList);
    setResumeInfo({ ...resumeInfo, experience: updatedList });
  };

  // Remove an experience entry by index
  const removeExperience = (index) => {
    if (experienceList.length > 0) {
      const updatedList = experienceList.filter((_, i) => i !== index);
      setExperienceList(updatedList);
      setResumeInfo({ ...resumeInfo, experience: updatedList });
    } else {
      toast('At least one experience entry is required!');
    }
  };

  // Save the experience details
  const onSave = () => {
    setLoading(true);
    const data = {
      data: {
        experience: experienceList.map(({ id, workSummery, startDate, endDate, ...rest }) => ({
          ...rest,
          startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : '',
          endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : '',
          workSummery: workSummery, // now should be a plain string
        })),
      },
    };
    console.log("Payload data:", data.data.experience[0].workSummery);

    GlobalApi.UpdateResumeDetail(params.resumeId, data)
      .then(() => {
        setLoading(false);
        toast('Details updated!');
      })
      .catch(() => {
        setLoading(false);
        toast('Server Error, Please try again!');
      });
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Professional Experience</h2>
      <p>Add your previous job experience</p>

      <div>
        {experienceList.map((item, index) => (
          <div key={index} className="grid grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
            <div className="col-span-2">
              <label className="text-xs">Position Title</label>
              <Input
                name="title"
                onChange={(e) => handleChange(e, index)}
                value={item.title || ''}
              />
            </div>
            <div>
              <label className="text-xs">Company Name</label>
              <Input
                name="companyName"
                onChange={(e) => handleChange(e, index)}
                value={item.companyName || ''}
              />
            </div>
            <div>
              <label className="text-xs">City</label>
              <Input
                name="city"
                onChange={(e) => handleChange(e, index)}
                value={item.city || ''}
              />
            </div>
            <div>
              <label className="text-xs">State</label>
              <Input
                name="state"
                onChange={(e) => handleChange(e, index)}
                value={item.state || ''}
              />
            </div>
            <div>
              <label className="text-xs">Start Date</label>
              <Input
                type="date"
                name="startDate"
                onChange={(e) => handleChange(e, index)}
                value={item.startDate || ''}
              />
            </div>
            <div>
              <label className="text-xs">End Date</label>
              <Input
                type="date"
                name="endDate"
                onChange={(e) => handleChange(e, index)}
                value={item.endDate || ''}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs">Work Summary</label>
              <RichTextEditor
                index={index}
                defaultValue={item.workSummery || ''}
                onRichTextEditorChange={handleRichTextEditorChange}
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <Button
                variant="outline"
                onClick={() => removeExperience(index)}
                className="text-primary"
              >
                - Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={addNewExperience} className="text-primary">
          + Add More Experience
        </Button>
        <Button disabled={loading} onClick={onSave}>
          {loading ? <LoaderCircle className="animate-spin" /> : 'Save'}
        </Button>
      </div>
    </div>
  );
}

export default Experience;
