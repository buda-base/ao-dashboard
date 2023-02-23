#!/usr/bin/env python3
"""
Project scripts. Manual invocations of what will be in a service
"""

from BdrcDbLib.DbOrm.DrsContextBase import DrsDbContextBase
from BdrcDbLib.DbOrm.models.DrsProjectMgmt import ProjectTypes, ProjectMembers, Projects, MemberTypes
from sqlalchemy.future import select


class InvalidProjectException(Exception):
    pass


# Loaded dynamically
valid_member_types = ""
valid_project_types = ""


def get_valid_member_types() -> [str]:
    """
    Get the valid member types
    :return:
    """
    vmts: [] = []
    with DrsDbContextBase() as ctx:
        # .all() returns tuples, We know we're only getting one column
        vmts = [x for x in ctx.session.execute(select(MemberTypes.m_type)).scalars()]
    return vmts


def get_valid_project_types() -> [str]:
    vpts: [] = []
    with DrsDbContextBase() as ctx:
        # .all() returns tuples, We know we're only getting one column
        vpts = [x for x in ctx.session.execute(select(ProjectTypes.project_type_name)).scalars()]
    return vpts

def valid_elem(desc: str, elem: str, valids: [str]):
    """
    Validate a value against a  range
    :param desc: error description
    :param elem: potential value
    :param valids: range of allowed values
    :return: Nothing. Throw if fails
    """
    if elem not in valids:
        raise InvalidProjectException(
            f"Invalid project {desc}:{elem}. Valid Project types are {valids}")


def create_project(name: str, desc: str, project_type_name: str, member_type_name: str):
    """
    Creates an AO Dashboard project
    :param name: project name
    :param desc: long description
    :param project_type_name: One of the ProjectTypes.project_type_name values
    :param member_type_name: One of the  MemberTypes.type name values
    :return:
    """

    valid_elem("project type", project_type_name, valid_project_types)
    valid_elem("member type", member_type_name, valid_member_types)

    with DrsDbContextBase() as ctx:
        new_project = Projects(name=name, description=desc)


        pt = select(ProjectTypes).where(ProjectTypes.project_type_name == project_type_name)
        print(pt)
        new_project.project_type = ctx.session.execute(pt).first()

        mt = select(MemberTypes).where(MemberTypes.m_type == member_type_name)
        new_project.project_mtype = ctx.session.execute(mt).first()
        if new_project.project_mtype is None:
            raise InvalidProjectException(f"Member")
        ctx.session.add(new_project)
        ctx.session.commit()


if __name__ == '__main__':
    ao_gb_metadata_desc = """\
    Metadata for Google books. Sends one MARC record for each work from BUDA to Google Books.
    Each MARC record contains bibliographical data for each of its volumes.
    """

    ao_gb_metadata_name = "Google Books Metadata"
    ao_gb_project_type = "Distribution"
    ao_gb_project_member_type = "Work"
    valid_project_types = get_valid_project_types()
    valid_member_types = get_valid_member_types()

    create_project(ao_gb_metadata_name,ao_gb_metadata_desc,ao_gb_project_type, ao_gb_project_member_type)
