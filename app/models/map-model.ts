import {Entity, Column, ManyToOne, PrimaryGeneratedColumn, JoinColumn, EntityRepository, Repository} from 'typeorm'
import {MediaFile} from './media-model'
import {Library} from './library-model'

@Entity()
export class Map
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column({name: 'library_id'})
    public libraryId: number;

    @ManyToOne(t => Library)
    @JoinColumn({name: 'library_id'})
    public library: Library;

    @Column()
    public title: string

    @Column({name: 'media_id'})
    public mediaId: number;

    @ManyToOne(t => MediaFile)
    @JoinColumn({name: 'media_id'})
    public media?: MediaFile
}

@EntityRepository(Map)
export class MapRepository extends Repository<Map>
{
    public async findAllByLibrary({libraryID}: {libraryID: number})
    {
        return this.find({
            select: [
                'id',
                'title',
                'media'
            ],
            where: {
                libraryId: libraryID
            }
        })
    }
}