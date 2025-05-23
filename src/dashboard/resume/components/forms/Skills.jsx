import { Input } from '@/components/ui/input';
import React, { useContext, useEffect, useState } from 'react';
import { Rating } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import GlobalApi from './../../../../../service/GlobalApi';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

function Skills() {
  const [skillsList, setSkillsList] = useState([{ name: '', rating: 0 }]);
  const { resumeId } = useParams();
  const [loading, setLoading] = useState(false);
  const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);

  // Initialize skillsList from resumeInfo when the component mounts or resumeInfo changes
  useEffect(() => {
    if (resumeInfo && Array.isArray(resumeInfo.skills)) {
      setSkillsList(resumeInfo.skills);
    }
  }, [resumeInfo]);

  // Update the local state and immediately update context on every change
  const handleChange = (index, name, value) => {
    const newEntries = [...skillsList];
    newEntries[index][name] = value;
    setSkillsList(newEntries);
    // Immediately update context with new skills list
    setResumeInfo({ ...resumeInfo, skills: newEntries });
  };

  const AddNewSkills = () => {
    const updated = [...skillsList, { name: '', rating: 0 }];
    setSkillsList(updated);
    setResumeInfo({ ...resumeInfo, skills: updated });
  };

  const RemoveSkills = () => {
    const updated = skillsList.slice(0, -1);
    setSkillsList(updated);
    setResumeInfo({ ...resumeInfo, skills: updated });
  };

  const onSave = () => {
    setLoading(true);
    const data = {
      data: {
        skills: skillsList.map(({ id, ...rest }) => rest),
      },
    };

    GlobalApi.UpdateResumeDetail(resumeId, data)
      .then((resp) => {
        console.log(resp);
        setLoading(false);
        toast('Details updated!');
      })
      .catch((error) => {
        setLoading(false);
        toast('Server Error, Try again!');
      });
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Skills</h2>
      <p>Add Your top professional key skills</p>

      <div>
        {skillsList.map((item, index) => (
          <div
            className="flex justify-between mb-2 border rounded-lg p-3"
            key={index}
          >
            <div>
              <label className="text-xs">Name</label>
              <Input
                className="w-full"
                value={item.name}
                onChange={(e) =>
                  handleChange(index, 'name', e.target.value)
                }
              />
            </div>
            <Rating
              style={{ maxWidth: 120 }}
              value={item.rating}
              onChange={(v) => handleChange(index, 'rating', v)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={AddNewSkills} className="text-primary">
            + Add More Skill
          </Button>
          <Button variant="outline" onClick={RemoveSkills} className="text-primary">
            - Remove
          </Button>
        </div>
        <Button disabled={loading} onClick={onSave}>
          {loading ? <LoaderCircle className="animate-spin" /> : 'Save'}
        </Button>
      </div>
    </div>
  );
}

export default Skills;
